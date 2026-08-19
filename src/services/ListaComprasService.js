// src/services/ListaComprasService.js
// Fonte única de verdade para listas de compras e integração com o financeiro.
// Regra beta.4: item marcado como pago = despesa paga lançada imediatamente.

import db from '../db/db';
import { calcularValorItem } from '../components/listaCompras/constants';
import MovimentacaoService from './MovimentacaoService';

const mesAnoDaData = (data = new Date()) =>
  `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;

const valorRealDoItem = (item, informado = null) => {
  const valor = informado !== null && informado !== undefined && informado !== ''
    ? Number(informado)
    : Number(item.valorTotalReal ?? item.valorTotal ?? 0);
  return Number.isFinite(valor) ? Math.max(0, valor) : 0;
};

const ListaComprasService = {
  async carregarListas() {
    return db.listas.orderBy('dataCriacao').reverse().toArray();
  },

  async carregarItens(listaId) {
    // Corrige automaticamente vínculos de itens marcados em versões antigas.
    // Assim, um item que a lista mostra como pago também existe no fluxo financeiro.
    await this.sincronizarPagosLegados(listaId);
    const itens = await db.itensLista.where('listaId').equals(listaId).toArray();
    return itens.filter(i => i.status !== 'removido');
  },

  async criarLista(nome, orcamento = 0) {
    return db.listas.add({
      nome: String(nome || '').trim(),
      orcamento: parseFloat(orcamento) || 0,
      status: 'aberta',
      dataCriacao: new Date().toISOString(),
      dataFechamento: null,
      totalEstimado: 0,
      totalReal: 0,
    });
  },

  async editarLista(listaId, dados) {
    await db.transaction('rw', db.listas, db.gastos, async () => {
      await db.listas.update(listaId, dados);
      if (dados?.nome) {
        await db.gastos.where('origemLista').equals(listaId).modify({
          nomeLista: String(dados.nome).trim(),
        });
      }
    });
  },

  async excluirLista(listaId) {
    // Excluir a lista não apaga despesas já pagas. O histórico financeiro é
    // independente da organização visual da lista.
    await db.transaction('rw', db.itensLista, db.listas, async () => {
      await db.itensLista.where('listaId').equals(listaId).delete();
      await db.listas.delete(listaId);
    });
  },

  async concluirLista(listaId) {
    await this.sincronizarPagosLegados(listaId);
    const itens = await db.itensLista.where('listaId').equals(listaId).toArray();
    const pagos = itens.filter(i => i.status === 'comprado');
    const totalPago = pagos.reduce((s, i) => s + valorRealDoItem(i), 0);

    await db.listas.update(listaId, {
      status: 'concluida',
      dataFechamento: new Date().toISOString(),
      totalReal: totalPago,
    });

    return totalPago;
  },

  async reabrirLista(listaId) {
    // Reabrir nunca desfaz pagamentos nem apaga lançamentos financeiros.
    await db.listas.update(listaId, { status: 'aberta', dataFechamento: null });
  },

  async adicionarItem(listaId, dados) {
    const valorTotal = calcularValorItem({
      quantidade: dados.quantidade,
      unidade: dados.unidade,
      precoPorMedida: dados.precoPorMedida,
    });

    const id = await db.itensLista.add({
      listaId,
      nome: String(dados.nome || '').trim(),
      categoria: dados.categoria || 'Outros',
      quantidade: parseFloat(dados.quantidade) || 1,
      unidade: dados.unidade || 'un',
      precoPorMedida: parseFloat(dados.precoPorMedida) || 0,
      valorTotal,
      valorTotalReal: null,
      status: 'pendente',
      gastoId: null,
      dataPagamento: null,
    });

    await this.recalcularTotais(listaId);
    return id;
  },

  async editarItem(itemId, dados) {
    const item = await db.itensLista.get(itemId);
    if (!item) return;

    const merged = { ...item, ...dados };
    const valorTotal = calcularValorItem({
      quantidade: merged.quantidade,
      unidade: merged.unidade,
      precoPorMedida: merged.precoPorMedida,
    });

    await db.transaction('rw', db.itensLista, db.gastos, db.listas, db.movimentacoes, async () => {
      await db.itensLista.update(itemId, { ...dados, valorTotal });

      if (item.status === 'comprado') {
        const atualizado = { ...merged, valorTotal };
        const gasto = await this._buscarGastoVinculado(atualizado);
        if (gasto) {
          const alteracoesGasto = {
            nome: `🛒 ${atualizado.nome}`,
            categoria: atualizado.categoria || 'Mercado',
            valor: valorRealDoItem(atualizado),
          };
          await db.gastos.update(gasto.id, alteracoesGasto);
          const movimentos = await db.movimentacoes.toArray();
          const vinculados = movimentos.filter(m =>
            m.chaveOrigem === `lista:${item.id}` ||
            (m.origem === 'lista_compras' && String(m.origemId) === String(item.id)) ||
            String(m.entidadeId ?? '') === String(gasto.id) ||
            String(m.referenciaId ?? '') === String(gasto.id)
          );
          for (const mov of vinculados) {
            await db.movimentacoes.update(mov.id, {
              descricao: alteracoesGasto.nome,
              categoria: alteracoesGasto.categoria,
              valor: alteracoesGasto.valor,
              atualizadoEm: new Date().toISOString(),
            });
          }
        }
      }

      await this._recalcularTotaisTx(item.listaId);
    });
  },

  async marcarComprado(itemId, valorTotalReal = null) {
    const item = await db.itensLista.get(itemId);
    if (!item) return 0;
    const lista = await db.listas.get(item.listaId);
    if (!lista) return 0;

    const valor = valorRealDoItem(item, valorTotalReal);
    const agora = new Date();
    let gastoId = item.gastoId || null;

    await db.transaction('rw', db.itensLista, db.gastos, db.listas, db.movimentacoes, async () => {
      const gastoExistente = await this._buscarGastoVinculado(item);
      const dadosGasto = this._montarGasto(item, lista, valor, agora);

      if (gastoExistente) {
        gastoId = gastoExistente.id;
        await db.gastos.update(gastoExistente.id, dadosGasto);
      } else if (valor > 0) {
        gastoId = await db.gastos.add(dadosGasto);
      }

      if (gastoId) {
        const gastoFinal = { ...dadosGasto, id: gastoId };
        const movDados = MovimentacaoService.montarDeGasto(gastoFinal, dadosGasto.mesAno, agora);
        movDados.competencia = dadosGasto.mesAno;
        const movExistente = await db.movimentacoes.where('chaveOrigem').equals(movDados.chaveOrigem).first();
        if (movExistente) await db.movimentacoes.update(movExistente.id, { ...movDados, atualizadoEm: new Date().toISOString() });
        else await db.movimentacoes.add({ ...movDados, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
      }

      await db.itensLista.update(itemId, {
        status: 'comprado',
        valorTotalReal: valor,
        gastoId,
        dataPagamento: agora.toISOString(),
      });
      await this._recalcularTotaisTx(item.listaId);
    });

    return valor;
  },

  async desmarcarComprado(itemId) {
    const item = await db.itensLista.get(itemId);
    if (!item) return;

    await db.transaction('rw', db.itensLista, db.gastos, db.listas, db.movimentacoes, async () => {
      // Remove todos os artefatos financeiros relacionados ao item, inclusive
      // vínculos criados por versões anteriores do app.
      await this._removerFinanceiroDoItemTx(item);

      await db.itensLista.update(itemId, {
        status: 'pendente',
        valorTotalReal: null,
        gastoId: null,
        dataPagamento: null,
      });
      await this._recalcularTotaisTx(item.listaId);
    });
  },

  async removerItem(itemId) {
    const item = await db.itensLista.get(itemId);
    if (!item) return;

    await db.transaction('rw', db.itensLista, db.gastos, db.listas, db.movimentacoes, async () => {
      // Não dependemos apenas de status="comprado": um item pode ter sido
      // parcialmente migrado e ainda possuir gasto/movimentação vinculados.
      await this._removerFinanceiroDoItemTx(item);
      await db.itensLista.delete(itemId);
      await this._recalcularTotaisTx(item.listaId);
    });
  },

  async recalcularTotais(listaId) {
    await db.transaction('rw', db.itensLista, db.listas, async () => {
      await this._recalcularTotaisTx(listaId);
    });
  },

  async sincronizarPagosLegados(listaId) {
    const lista = await db.listas.get(listaId);
    if (!lista) return;
    const itens = await db.itensLista.where('listaId').equals(listaId).toArray();
    const pagosSemVinculo = itens.filter(i => i.status === 'comprado' && !i.gastoId);
    if (!pagosSemVinculo.length) return;

    await db.transaction('rw', db.itensLista, db.gastos, db.movimentacoes, async () => {
      for (const item of pagosSemVinculo) {
        let gasto = await this._buscarGastoVinculado(item);
        if (!gasto) {
          const data = item.dataPagamento ? new Date(item.dataPagamento) :
            (lista.dataFechamento ? new Date(lista.dataFechamento) : new Date());
          const valor = valorRealDoItem(item);
          if (valor > 0) {
            const id = await db.gastos.add(this._montarGasto(item, lista, valor, data));
            gasto = { id };
          }
        }
        if (gasto?.id) {
          await db.itensLista.update(item.id, { gastoId: gasto.id });
          const gastoCompleto = await db.gastos.get(gasto.id);
          if (gastoCompleto) {
            const data = item.dataPagamento ? new Date(item.dataPagamento) : new Date();
            const movDados = MovimentacaoService.montarDeGasto(gastoCompleto, gastoCompleto.mesAno, data);
            const existente = await db.movimentacoes.where('chaveOrigem').equals(movDados.chaveOrigem).first();
            if (!existente) await db.movimentacoes.add({ ...movDados, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
          }
        }
      }
    });
  },

  _montarGasto(item, lista, valor, data) {
    const segura = data instanceof Date && !Number.isNaN(data.getTime()) ? data : new Date();
    return {
      nome: `🛒 ${item.nome}`,
      valor,
      categoria: item.categoria || 'Mercado',
      tipoOperacao: 'despesa',
      mesAno: mesAnoDaData(segura),
      dia: segura.getDate(),
      pago: true,
      origemLista: item.listaId,
      origemItemLista: item.id,
      nomeLista: lista.nome,
      origem: 'lista_compras',
    };
  },

  async _buscarGastoVinculado(item) {
    if (item.gastoId) {
      const porId = await db.gastos.get(item.gastoId);
      if (porId) return porId;
    }

    const porItem = await db.gastos.where('origemItemLista').equals(item.id).first();
    if (porItem) return porItem;

    // Compatibilidade beta.2: lançamentos antigos conheciam apenas a lista.
    const gastosLista = await db.gastos.where('origemLista').equals(item.listaId).toArray();
    const nomeEsperado = `🛒 ${item.nome}`;
    return gastosLista.find(g => !g.origemItemLista && g.nome === nomeEsperado) || null;
  },

  async _removerFinanceiroDoItemTx(item) {
    const gastosRelacionados = await db.gastos.where('origemItemLista').equals(item.id).toArray();
    const gastoPorId = item.gastoId ? await db.gastos.get(item.gastoId) : null;
    if (gastoPorId && !gastosRelacionados.some(g => g.id === gastoPorId.id)) gastosRelacionados.push(gastoPorId);

    // Compatibilidade com beta.2/beta.3: alguns lançamentos só conheciam a lista
    // e o nome do produto, sem origemItemLista.
    if (!gastosRelacionados.length) {
      const legado = await this._buscarGastoVinculado(item);
      if (legado) gastosRelacionados.push(legado);
    }

    const gastoIds = new Set(gastosRelacionados.map(g => String(g.id)));
    const movimentos = await db.movimentacoes.toArray();
    const idsMovimentos = movimentos.filter(m => {
      const chaveNova = m.chaveOrigem === `lista:${item.id}`;
      const origemItem = m.origem === 'lista_compras' && String(m.origemId) === String(item.id);
      const porEntidade = gastoIds.has(String(m.entidadeId ?? '')) || gastoIds.has(String(m.referenciaId ?? ''));
      const chaveGastoLegada = [...gastoIds].some(id => String(m.chaveOrigem || '').startsWith(`gasto:${id}:`));
      return chaveNova || origemItem || porEntidade || chaveGastoLegada;
    }).map(m => m.id);

    if (idsMovimentos.length) await db.movimentacoes.bulkDelete([...new Set(idsMovimentos)]);
    if (gastosRelacionados.length) await db.gastos.bulkDelete([...new Set(gastosRelacionados.map(g => g.id))]);
  },

  async _recalcularTotaisTx(listaId) {
    const itens = await db.itensLista.where('listaId').equals(listaId).toArray();
    const ativos = itens.filter(i => i.status !== 'removido');
    const totalEstimado = ativos.reduce((s, i) => s + Number(i.valorTotal || 0), 0);
    const totalReal = ativos
      .filter(i => i.status === 'comprado')
      .reduce((s, i) => s + valorRealDoItem(i), 0);
    await db.listas.update(listaId, { totalEstimado, totalReal });
  },
};

export default ListaComprasService;
