// src/services/FinanceiroService.js
// Serviço financeiro central do SaldoReal.
// beta.4: dinheiro efetivado vem exclusivamente de db.movimentacoes.

import db from '../db/db';
import u from '../utils/financeiro';
import MovimentacaoService from './MovimentacaoService';

const n = (v) => {
  const x = Number(v || 0);
  return Number.isFinite(x) ? x : 0;
};

const mesNumero = (mesAno) => u.mesAnoParaNum(mesAno);

const parcelasPagasAteMes = (acordo, mesAlvo) => {
  const historico = Array.isArray(acordo.historicoPagamentos) ? acordo.historicoPagamentos : [];
  const alvo = mesNumero(u.dateParaMesAno(mesAlvo));
  const pagos = new Set();

  historico.forEach(h => {
    const parcela = parseInt(h.parcela) || 0;
    if (parcela <= 0 || !h.data) return;
    const partes = String(h.data).split('/');
    if (partes.length !== 3) return;
    if (Number(`${partes[2]}${partes[1]}`) <= alvo) pagos.add(parcela);
  });

  // Compatibilidade com acordos antigos que só guardavam a contagem.
  // Se existe histórico regular, mesmo que o pagamento tenha ocorrido depois do
  // mês consultado, não usamos a contagem atual para reescrever o passado.
  const temHistoricoRegular = historico.some(h => (parseInt(h.parcela) || 0) > 0);
  if (!temHistoricoRegular) {
    const quantidade = Math.max(0, parseInt(acordo.parcelasPagas) || 0);
    for (let numero = 1; numero <= quantidade; numero += 1) pagos.add(numero);
  }
  return pagos;
};

const parcelasDevidasAteMes = (acordo, mesAlvo) => {
  if (!acordo || acordo.situacao !== 'acordo') return 0;
  const totais = Math.max(1, parseInt(acordo.parcelas) || 1);
  const esperadas = u.parcelasEsperadas(acordo, mesAlvo);
  if (esperadas <= 0) return 0;
  const limite = Math.min(totais, esperadas);
  const pagas = parcelasPagasAteMes(acordo, mesAlvo);
  let devidas = 0;
  for (let numero = 1; numero <= limite; numero += 1) {
    if (!pagas.has(numero)) devidas += 1;
  }
  return devidas;
};


const fluxoAcordoNoMes = (acordo, mesAlvo, movimentos = []) => {
  const mesFluxo = u.dateParaMesAno(mesAlvo);
  const pagos = movimentos.filter(m =>
    m.origem === 'acordo' && String(m.origemId) === String(acordo.id) && m.mesFluxo === mesFluxo
  );
  const valorPago = pagos.reduce((s, m) => s + n(m.valor), 0);
  const parcelasDevidas = parcelasDevidasAteMes(acordo, mesAlvo);
  return {
    pagamentos: pagos,
    pagamentosMes: pagos.length,
    valorPago,
    parcelasDevidas,
    valorPendente: parcelasDevidas * n(acordo.valorParcela),
  };
};

const gastoLiquidadoNaCompetencia = (gasto, competencia, movimentos) =>
  movimentos.some(m => {
    if (m.competencia !== competencia) return false;
    if (gasto.origemItemLista && m.origem === 'lista_compras')
      return String(m.origemId) === String(gasto.origemItemLista);
    return String(m.entidadeId ?? m.referenciaId) === String(gasto.id);
  });

const gastoTemMovimento = (gasto, movimentos) =>
  movimentos.some(m => {
    if (gasto.origemItemLista && m.origem === 'lista_compras')
      return String(m.origemId) === String(gasto.origemItemLista);
    return String(m.entidadeId ?? m.referenciaId) === String(gasto.id);
  });

const movimentoParaItem = (m) => ({
  ...m,
  id: m.id,
  movimentacaoId: m.id,
  nome: m.descricao || 'Movimentação',
  valor: n(m.valor),
  tipoOperacao: m.tipo,
  operacao: m.tipo,
  categoria: m.categoria || 'Outros',
  dia: Number(String(m.data || '').slice(8, 10)) || 1,
  isPago: true,
  parcelaText: m.origem === 'acordo' && Number(m.parcela || 0) > 0 ? `parcela ${m.parcela}` : null,
  tipo: 'movimentacao',
});

const FinanceiroService = {
  // ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────
  async getConfig(chave, padrao = null) {
    try {
      const reg = await db.configuracoes.get(chave);
      return reg ? reg.valor : padrao;
    } catch { return padrao; }
  },
  async setConfig(chave, valor) { await db.configuracoes.put({ chave, valor }); },
  async getUsuario() { return this.getConfig('usuario', ''); },
  async setUsuario(nome) { return this.setConfig('usuario', nome); },
  async getRenda() { return this.getConfig('renda', 0); },
  async setRenda(val) { return this.setConfig('renda', val); },
  async getDiaPagamento() { return this.getConfig('diaPagamento', null); },
  async setDiaPagamento(dia) { return this.setConfig('diaPagamento', dia); },

  // ── LEITURA ───────────────────────────────────────────────────────────────
  async carregarAcordos() { return db.acordos.toArray(); },
  async carregarGastos() { return db.gastos.toArray(); },
  async carregarGasto(id) { return db.gastos.get(id); },
  async carregarMovimentacoes() { return db.movimentacoes.toArray(); },
  async carregarTudo() {
    const [acordos, gastos, movimentacoes] = await Promise.all([
      db.acordos.toArray(), db.gastos.toArray(), db.movimentacoes.toArray(),
    ]);
    return { acordos, gastos, movimentacoes };
  },

  // ── PENDÊNCIAS / DASHBOARD ────────────────────────────────────────────────
  async debitoDoMes() {
    const { acordos, gastos, movimentacoes } = await this.carregarTudo();
    const hoje = new Date();
    const competencia = u.dateParaMesAno(hoje);

    const valorAcordos = acordos.reduce((acc, acordo) =>
      acc + fluxoAcordoNoMes(acordo, hoje, movimentacoes).valorPendente, 0);

    const valorGastos = gastos.reduce((acc, gasto) => {
      if (gasto.tipoOperacao !== 'despesa') return acc;
      const pertence = gasto.mesAno === 'fixo' || gasto.mesAno === competencia;
      if (!pertence || gastoLiquidadoNaCompetencia(gasto, competencia, movimentacoes)) return acc;
      return acc + n(gasto.valor);
    }, 0);

    return valorAcordos + valorGastos;
  },

  async alertasDeVencimento(diasAntecedencia = 5) {
    const { acordos, gastos, movimentacoes } = await this.carregarTudo();
    const hoje = new Date();
    const mesAtual = u.dateParaMesAno(hoje);
    const alertas = [];

    acordos.forEach(a => {
      if (a.situacao !== 'acordo') return;
      const totais = Math.max(1, parseInt(a.parcelas) || 1);
      const pagas = parcelasPagasAteMes(a, hoje);
      let numero = null;
      for (let i = 1; i <= totais; i += 1) {
        if (!pagas.has(i)) { numero = i; break; }
      }
      if (!numero) return;
      const data = u.dataVencimentoParcela(a, numero);
      if (!data) return;
      const diff = u.diferencaDias(data, hoje);
      if (diff == null || diff > diasAntecedencia) return;
      alertas.push({
        tipo: 'acordo', nome: a.empresa, dia: data.getDate(), dataVencimento: data,
        valor: a.valorParcela, diff, parcela: numero, atrasado: diff < 0,
      });
    });

    gastos.forEach(g => {
      if (g.tipoOperacao !== 'despesa') return;
      let competencia = g.mesAno;
      let mes = null;
      if (g.mesAno === 'fixo') {
        competencia = mesAtual;
        mes = hoje;
        if (gastoLiquidadoNaCompetencia(g, competencia, movimentacoes)) {
          mes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
          competencia = u.dateParaMesAno(mes);
        }
      } else {
        if (gastoTemMovimento(g, movimentacoes)) return;
        mes = u.mesAnoParaDate(g.mesAno);
        if (!mes) return;
      }
      const data = u.dataVencimentoNoMes(g.dia, mes);
      const diff = u.diferencaDias(data, hoje);
      if (diff == null || diff > diasAntecedencia) return;
      alertas.push({
        tipo: 'gasto', nome: g.nome, dia: data.getDate(), dataVencimento: data,
        valor: g.valor, diff, atrasado: diff < 0, competencia,
      });
    });

    return alertas.sort((a, b) => a.diff - b.diff);
  },

  async resumoSaldoDoMes() {
    const [movimentos, renda, pendencias] = await Promise.all([
      MovimentacaoService.listarMes(u.dateParaMesAno(new Date())),
      this.getRenda(),
      this.debitoDoMes(),
    ]);

    let entradasExtrasPagas = 0;
    let rendaBaseRegistrada = 0;
    let despesasPagas = 0;

    movimentos.forEach(m => {
      if (m.tipo === 'despesa') {
        despesasPagas += n(m.valor);
      } else if (m.origem === 'renda' || u.ehEntradaRendaBase(m)) {
        rendaBaseRegistrada += n(m.valor);
      } else {
        entradasExtrasPagas += n(m.valor);
      }
    });

    const { rendaBase, receitaConsiderada, saldoDisponivel, saldoProjetado } = u.calcularResumoSaldo({
      rendaConfigurada: renda,
      rendaBaseRegistrada,
      entradasExtrasPagas,
      despesasPagas,
      pendencias,
    });

    return {
      rendaBase, rendaBaseRegistrada, entradasExtrasPagas, receitaConsiderada,
      despesasPagas, pendencias, saldoDisponivel, saldoProjetado,
    };
  },

  async saldoRealDoMes() {
    const movimentos = await MovimentacaoService.listarMes(u.dateParaMesAno(new Date()));
    return movimentos.reduce((s, m) => s + (m.tipo === 'entrada' ? n(m.valor) : -n(m.valor)), 0);
  },

  async dadosDashboard() {
    const [alertas, resumo] = await Promise.all([this.alertasDeVencimento(), this.resumoSaldoDoMes()]);
    return { debito: resumo.pendencias, alertas, ...resumo };
  },

  // ── INSIGHTS ──────────────────────────────────────────────────────────────
  async calcularSaldoRestante() { return (await this.resumoSaldoDoMes()).saldoProjetado; },
  async calcularPercentualGasto() {
    const { receitaConsiderada, despesasPagas } = await this.resumoSaldoDoMes();
    if (receitaConsiderada <= 0) return 0;
    return Math.min(100, Math.round((despesasPagas / receitaConsiderada) * 100));
  },

  async gastoDeHoje() {
    const hoje = u.dateParaISOInput(new Date());
    const movimentos = await MovimentacaoService.listarMes(u.dateParaMesAno(new Date()));
    return movimentos
      .filter(m => m.tipo === 'despesa' && m.data === hoje)
      .reduce((s, m) => s + n(m.valor), 0);
  },

  async obterMaiorCategoria() {
    const { acordos, gastos, movimentacoes } = await this.carregarTudo();
    const hoje = new Date();
    const competencia = u.dateParaMesAno(hoje);
    const totais = {};

    movimentacoes
      .filter(m => m.mesFluxo === competencia && m.tipo === 'despesa')
      .forEach(m => { totais[m.categoria || 'Outros'] = (totais[m.categoria || 'Outros'] || 0) + n(m.valor); });

    gastos.forEach(g => {
      if (g.tipoOperacao !== 'despesa') return;
      if (!(g.mesAno === 'fixo' || g.mesAno === competencia)) return;
      if (gastoLiquidadoNaCompetencia(g, competencia, movimentacoes)) return;
      const cat = g.categoria || 'Outros';
      totais[cat] = (totais[cat] || 0) + n(g.valor);
    });

    let pendenteAcordos = 0;
    acordos.forEach(a => { pendenteAcordos += fluxoAcordoNoMes(a, hoje, movimentacoes).valorPendente; });
    if (pendenteAcordos > 0)
      totais['Acordos/Dívidas'] = (totais['Acordos/Dívidas'] || 0) + pendenteAcordos;

    const entradas = Object.entries(totais);
    if (!entradas.length) return null;
    const [categoria, total] = entradas.sort((a, b) => b[1] - a[1])[0];
    return { categoria, total };
  },

  async projecaoDoMes() {
    const hoje = new Date();
    const movimentos = await MovimentacaoService.listarMes(u.dateParaMesAno(hoje));
    const totalPago = movimentos
      .filter(m => m.tipo === 'despesa')
      .reduce((s, m) => s + n(m.valor), 0);
    if (totalPago === 0) return null;
    const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    return Math.round((totalPago / hoje.getDate()) * diasNoMes);
  },

  async gerarInsight() {
    const [percentual, maiorCat, renda] = await Promise.all([
      this.calcularPercentualGasto(), this.obterMaiorCategoria(), this.getRenda(),
    ]);
    if (renda <= 0) return { emoji: '💡', texto: 'Configure sua renda mensal para receber insights personalizados.', tipo: 'info' };
    if (percentual >= 100) return { emoji: '🚨', texto: 'Atenção! Seus gastos já ultrapassaram a renda do mês.', tipo: 'error' };
    if (percentual >= 80) return { emoji: '⚠️', texto: `Você já comprometeu ${percentual}% da renda. Cuidado com novos gastos!`, tipo: 'warning' };
    if (maiorCat?.total > 0) {
      const pct = Math.round((maiorCat.total / renda) * 100);
      if (pct >= 30) return { emoji: '📊', texto: `"${maiorCat.categoria}" está consumindo ${pct}% da sua renda este mês.`, tipo: 'warning' };
    }
    if (percentual <= 50) return { emoji: '✅', texto: `Você usou apenas ${percentual}% da renda. Ótimo controle financeiro!`, tipo: 'success' };
    return { emoji: '📈', texto: `${percentual}% da renda comprometida. Você está dentro do esperado.`, tipo: 'info' };
  },

  // ── RAZÃO / TELA GASTOS ──────────────────────────────────────────────────
  async dadosGastosMensais(mesOffset = 0) {
    const { acordos, gastos, movimentacoes } = await this.carregarTudo();
    const hoje = new Date();
    const mesAlvo = u.mesComOffset(mesOffset);
    const competencia = u.dateParaMesAno(mesAlvo);
    const alvoNum = mesNumero(competencia);
    const atualNum = mesNumero(u.dateParaMesAno(hoje));

    const movimentosMes = movimentacoes
      .filter(m => m.mesFluxo === competencia)
      .map(movimentoParaItem);

    const anteriores = movimentacoes.filter(m => mesNumero(m.mesFluxo || m.competencia) < alvoNum);
    const histEnt = anteriores.filter(m => m.tipo === 'entrada').reduce((s, m) => s + n(m.valor), 0);
    const histSai = anteriores.filter(m => m.tipo === 'despesa').reduce((s, m) => s + n(m.valor), 0);
    const sobraAnterior = Math.max(0, histEnt - histSai);

    const gastosPendentes = gastos.filter(g => {
      if (g.mesAno === 'fixo') {
        if (mesOffset < 0) return false;
        return !gastoLiquidadoNaCompetencia(g, competencia, movimentacoes);
      }
      const liquidado = gastoTemMovimento(g, movimentacoes);
      if (liquidado) return false;
      if (g.mesAno === competencia) return true;
      return mesOffset === 0 && mesNumero(g.mesAno) < atualNum;
    });

    const acordosPendentes = [];
    acordos.forEach(a => {
      if (a.situacao !== 'acordo') return;
      const fluxo = fluxoAcordoNoMes(a, mesAlvo, movimentacoes);
      if (fluxo.valorPendente > 0) {
        acordosPendentes.push({
          ...a, fluxoStatus: 'pendente', valorFluxo: fluxo.valorPendente,
          pagamentosMes: 0, parcelasDevidas: fluxo.parcelasDevidas,
        });
      }
    });

    return {
      gastos: gastosPendentes,
      movimentacoes: movimentosMes,
      acordos: acordosPendentes,
      sobraAnterior,
      mesAnoTarget: competencia,
    };
  },

  async dadosRelatorio(mesOffset = 0) {
    const { acordos, gastos, movimentacoes } = await this.carregarTudo();
    const mesAlvo = u.mesComOffset(mesOffset);
    const competencia = u.dateParaMesAno(mesAlvo);
    const alvoNum = mesNumero(competencia);
    const atualNum = mesNumero(u.dateParaMesAno(new Date()));

    const entradas = [];
    const despesas = [];
    const entradasPagas = [];
    const despesasPagas = [];
    const acordosPendentes = [];
    const acordosPagos = [];

    movimentacoes.filter(m => m.mesFluxo === competencia).forEach(m => {
      const item = movimentoParaItem(m);
      if (m.origem === 'acordo') return;
      if (m.tipo === 'entrada') entradasPagas.push(item);
      else despesasPagas.push(item);
    });

    gastos.forEach(g => {
      const liquidado = g.mesAno === 'fixo'
        ? gastoLiquidadoNaCompetencia(g, competencia, movimentacoes)
        : gastoTemMovimento(g, movimentacoes);
      if (liquidado) return;
      const pertence = g.mesAno === 'fixo' || g.mesAno === competencia ||
        (mesOffset === 0 && g.mesAno !== 'fixo' && mesNumero(g.mesAno) < atualNum);
      if (!pertence) return;
      if (g.tipoOperacao === 'entrada') entradas.push(g);
      else despesas.push(g);
    });

    const acordoMap = new Map(acordos.map(a => [String(a.id), a]));
    const pagosAgrupados = new Map();
    movimentacoes
      .filter(m => m.mesFluxo === competencia && m.origem === 'acordo')
      .forEach(m => {
        const key = String(m.origemId);
        const atual = pagosAgrupados.get(key) || { valor: 0, qtd: 0 };
        atual.valor += n(m.valor); atual.qtd += 1;
        pagosAgrupados.set(key, atual);
      });

    pagosAgrupados.forEach((pago, key) => {
      const acordo = acordoMap.get(key);
      if (!acordo) return;
      acordosPagos.push({
        ...acordo, valorFluxo: pago.valor, valorPagoMes: pago.valor,
        pagamentosMes: pago.qtd, origem: 'acordo',
      });
    });

    acordos.forEach(a => {
      const fluxo = fluxoAcordoNoMes(a, mesAlvo, movimentacoes);
      if (fluxo.valorPendente > 0) {
        acordosPendentes.push({ ...a, valorFluxo: fluxo.valorPendente, parcelasDevidas: fluxo.parcelasDevidas });
      }
    });

    const valor = item => n(item.valorFluxo ?? item.valor ?? item.valorParcela);
    const totalEnt = [...entradas, ...entradasPagas].reduce((s, i) => s + valor(i), 0);
    const totalSai = [...despesas, ...despesasPagas, ...acordosPendentes, ...acordosPagos].reduce((s, i) => s + valor(i), 0);
    const totalEntPago = entradasPagas.reduce((s, i) => s + valor(i), 0);
    const totalSaiPago = [...despesasPagas, ...acordosPagos].reduce((s, i) => s + valor(i), 0);

    return { entradas, entradasPagas, despesas, despesasPagas, acordosPendentes, acordosPagos, totalEnt, totalSai, totalEntPago, totalSaiPago };
  },

  async dadosGrafico(meses = 6) {
    const movimentacoes = await db.movimentacoes.toArray();
    const hoje = new Date();
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const resultado = [];
    for (let i = meses - 1; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = u.dateParaMesAno(d);
      const doMes = movimentacoes.filter(m => m.mesFluxo === mes);
      resultado.push({
        label: nomes[d.getMonth()],
        entradas: doMes.filter(m => m.tipo === 'entrada').reduce((s, m) => s + n(m.valor), 0),
        saidas: doMes.filter(m => m.tipo === 'despesa').reduce((s, m) => s + n(m.valor), 0),
      });
    }
    return resultado;
  },

  // ── ESCRITA — GASTOS ─────────────────────────────────────────────────────
  async registrarPagamentoGasto(item, competencia) {
    if (item?.tipo === 'acordo') throw new Error('Pagamentos de acordos devem ser registrados na tela de Acordos.');

    if (item?.tipo === 'movimentacao') {
      const movimento = await db.movimentacoes.get(item.movimentacaoId || item.id);
      if (!movimento) return;
      if (movimento.origem === 'acordo') throw new Error('Estorne pagamentos de acordo no dossiê do acordo.');
      if (movimento.origem === 'lista_compras') throw new Error('Desfaça compras pagas na própria Lista de Compras.');

      const gasto = await db.gastos.get(movimento.entidadeId || movimento.referenciaId);
      await db.transaction('rw', db.gastos, db.movimentacoes, async () => {
        if (gasto) {
          if (gasto.mesAno === 'fixo') {
            const pagos = (gasto.pagos || []).filter(m => m !== movimento.competencia);
            await db.gastos.update(gasto.id, { pagos });
          } else {
            await db.gastos.update(gasto.id, { pago: false });
          }
        }
        await db.movimentacoes.delete(movimento.id);
      });
      return;
    }

    const gasto = await db.gastos.get(item.id);
    if (!gasto) return;
    const jaPago = gastoLiquidadoNaCompetencia(gasto, competencia, await db.movimentacoes.toArray());
    if (jaPago) return;

    const hoje = new Date();
    const competenciaConta = gasto.mesAno === 'fixo' ? competencia : gasto.mesAno;
    const movimento = MovimentacaoService.montarDeGasto(gasto, competenciaConta, hoje);
    // competência representa a conta; mesFluxo, o dia real em que o dinheiro saiu.
    movimento.competencia = competenciaConta;

    await db.transaction('rw', db.gastos, db.movimentacoes, async () => {
      if (gasto.mesAno === 'fixo') {
        const pagos = Array.from(new Set([...(gasto.pagos || []), competenciaConta]));
        await db.gastos.update(gasto.id, { pagos });
      } else {
        await db.gastos.update(gasto.id, { pago: true });
      }
      const existente = await db.movimentacoes.where('chaveOrigem').equals(movimento.chaveOrigem).first();
      if (existente) await db.movimentacoes.update(existente.id, movimento);
      else await db.movimentacoes.add({ ...movimento, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
    });
  },

  async registrarPagamentoAcordo(acordo, qtd, data, valorRealPago = null) {
    const atual = await db.acordos.get(acordo.id);
    if (!atual) throw new Error('Acordo não encontrado.');
    const historico = [...(atual.historicoPagamentos || [])];
    const totais = Math.max(0, parseInt(atual.parcelas) || 0);
    const parcelasJaPagas = new Set(
      historico.map(h => parseInt(h.parcela) || 0).filter(parcela => parcela > 0),
    );
    if (parcelasJaPagas.size === 0) {
      const legado = Math.min(totais, Math.max(0, parseInt(atual.parcelasPagas) || 0));
      for (let numero = 1; numero <= legado; numero += 1) parcelasJaPagas.add(numero);
    }
    const faltantes = [];
    for (let numero = 1; numero <= totais; numero += 1) {
      if (!parcelasJaPagas.has(numero)) faltantes.push(numero);
    }
    const quantidade = Math.min(Math.max(1, parseInt(qtd) || 1), faltantes.length);
    if (!quantidade) return atual.situacao === 'quitado';

    const valorParcela = valorRealPago != null ? n(valorRealPago) : n(atual.valorParcela);
    const dataFormatada = String(data).split('-').reverse().join('/');
    const novos = [];

    for (let i = 0; i < quantidade; i++) {
      const parcela = faltantes[i];
      const pagamentoId = globalThis.crypto?.randomUUID?.() || `pag-${Date.now()}-${parcela}-${Math.random().toString(16).slice(2)}`;
      const vencimento = u.dataVencimentoParcela(atual, parcela);
      const pagamento = {
        pagamentoId, parcela, data: dataFormatada, valorPago: valorParcela,
        competencia: vencimento ? u.dateParaMesAno(vencimento) : u.dateParaMesAno(MovimentacaoService.dataValida(data)),
      };
      historico.push(pagamento);
      novos.push(pagamento);
    }

    const novasPagas = Math.min(totais, parcelasJaPagas.size + quantidade);
    const situacao = novasPagas >= totais ? 'quitado' : 'acordo';

    await db.transaction('rw', db.acordos, db.movimentacoes, async () => {
      await db.acordos.update(atual.id, { parcelasPagas: novasPagas, historicoPagamentos: historico, situacao });
      for (const pagamento of novos) {
        const mov = MovimentacaoService.montarDeAcordo(atual, pagamento);
        await db.movimentacoes.add({ ...mov, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
      }
    });
    return situacao === 'quitado';
  },

  async estornarPagamentoAcordo(acordoId, pagamentoId) {
    const acordo = await db.acordos.get(acordoId);
    if (!acordo) throw new Error('Acordo não encontrado.');
    const historico = [...(acordo.historicoPagamentos || [])];
    const idx = historico.findIndex(h => h.pagamentoId === pagamentoId);
    if (idx < 0) throw new Error('Pagamento não encontrado.');
    const [removido] = historico.splice(idx, 1);
    const eraParcela = Number(removido.parcela || 0) > 0;
    const parcelasPagas = Math.max(0, n(acordo.parcelasPagas) - (eraParcela ? 1 : 0));
    const situacao = acordo.situacao === 'quitado' && parcelasPagas < n(acordo.parcelas) ? 'acordo' : acordo.situacao;

    await db.transaction('rw', db.acordos, db.movimentacoes, async () => {
      await db.acordos.update(acordoId, { historicoPagamentos: historico, parcelasPagas, situacao });
      const chave = `acordo:${acordoId}:${pagamentoId}`;
      const movimento = await db.movimentacoes.where('chaveOrigem').equals(chave).first();
      if (movimento) await db.movimentacoes.delete(movimento.id);
    });
    return true;
  },

  async apagarGasto(id) {
    const gasto = await db.gastos.get(id);
    if (!gasto) return;
    await db.transaction('rw', db.gastos, db.movimentacoes, async () => {
      await db.gastos.delete(id);
      const movs = await db.movimentacoes.toArray();
      const ids = movs.filter(m => String(m.entidadeId ?? m.referenciaId) === String(id) && m.origem !== 'lista_compras').map(m => m.id);
      if (ids.length) await db.movimentacoes.bulkDelete(ids);
    });
  },

  async atualizarGasto(id, dados) {
    const atual = await db.gastos.get(id);
    if (!atual) return;
    await db.transaction('rw', db.gastos, db.movimentacoes, async () => {
      await db.gastos.update(id, dados);
      const novo = { ...atual, ...dados };
      // Atualiza a movimentação de gasto único já liquidado. Recorrências preservam histórico.
      if (novo.mesAno !== 'fixo') {
        const movs = await db.movimentacoes.toArray();
        const mov = movs.find(m => String(m.entidadeId ?? m.referenciaId) === String(id) && m.origem !== 'acordo');
        if (mov) await db.movimentacoes.update(mov.id, {
          descricao: novo.nome, valor: n(novo.valor), categoria: novo.categoria,
          tipo: novo.tipoOperacao === 'entrada' ? 'entrada' : 'despesa',
          origem: novo.tipoOperacao === 'entrada' && u.ehEntradaRendaBase(novo) ? 'renda' : (mov.origem === 'lista_compras' ? mov.origem : 'manual'),
          atualizadoEm: new Date().toISOString(),
        });
      }
    });
  },

  async criarGasto(dados) {
    const id = await db.gastos.add(dados);
    if (dados.pago) {
      const gasto = { ...dados, id };
      const competencia = dados.mesAno === 'fixo' ? u.dateParaMesAno(new Date()) : dados.mesAno;
      await MovimentacaoService.upsert(MovimentacaoService.montarDeGasto(gasto, competencia));
    }
    return id;
  },

  async criarGastos(lista) { return db.gastos.bulkAdd(lista); },

  async apagarAcordo(id) {
    await db.transaction('rw', db.acordos, db.movimentacoes, async () => {
      await db.acordos.delete(id);
      const movs = await db.movimentacoes.where('origem').equals('acordo').toArray();
      const ids = movs.filter(m => String(m.origemId) === String(id)).map(m => m.id);
      if (ids.length) await db.movimentacoes.bulkDelete(ids);
    });
  },

  async criarAcordo(dados) {
    const obj = { ...dados };
    const historico = [...(obj.historicoPagamentos || [])];
    historico.forEach((h, idx) => {
      if (!h.pagamentoId) h.pagamentoId = globalThis.crypto?.randomUUID?.() || `pag-${Date.now()}-${idx}-${Math.random().toString(16).slice(2)}`;
    });
    obj.historicoPagamentos = historico;
    const id = await db.acordos.add(obj);
    if (historico.length) {
      const acordo = { ...obj, id };
      for (const h of historico) await MovimentacaoService.upsert(MovimentacaoService.montarDeAcordo(acordo, h));
    }
    return id;
  },

  async atualizarAcordo(id, dados) {
    await db.acordos.update(id, dados);
    // Não recriamos históricos automaticamente em edição comum; pagamentos têm APIs próprias.
  },

  // ── BACKUP / RESTORE ──────────────────────────────────────────────────────
  async exportarTudo() {
    const [gastos, acordos, configuracoes, listas, itensLista, movimentacoes] = await Promise.all([
      db.gastos.toArray(), db.acordos.toArray(), db.configuracoes.toArray(),
      db.listas.toArray(), db.itensLista.toArray(), db.movimentacoes.toArray(),
    ]);
    return {
      app: 'SaldoReal', formatVersion: 3, createdAt: new Date().toISOString(),
      data: { gastos, acordos, configuracoes, listas, itensLista, movimentacoes },
    };
  },

  async importarTudo(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Backup inválido.');
    const versao = Number(payload.formatVersion || 0);
    if (versao > 3) throw new Error('Backup criado por uma versão mais nova do SaldoReal.');
    const versionado = versao >= 2;
    if (versionado && (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)))
      throw new Error(`Estrutura do backup v${versao} inválida.`);

    const dados = versionado ? payload.data : payload;
    const nomes = ['gastos', 'acordos', 'configuracoes', 'listas', 'itensLista', 'movimentacoes'];
    for (const nome of nomes) {
      if (dados[nome] !== undefined && !Array.isArray(dados[nome])) throw new Error(`Tabela ${nome} inválida no backup.`);
    }

    const tabelas = [db.gastos, db.acordos, db.configuracoes, db.listas, db.itensLista, db.movimentacoes];
    await db.transaction('rw', ...tabelas, async () => {
      for (const nome of nomes) {
        // Backups anteriores à beta.4 não possuíam movimentacoes; elas serão reconstruídas abaixo.
        if (!versionado && dados[nome] === undefined) continue;
        if (versao < 3 && nome === 'movimentacoes') continue;
        const tabela = db[nome];
        await tabela.clear();
        if ((dados[nome] || []).length) await tabela.bulkPut(dados[nome]);
      }

      if (versao < 3) {
        await db.movimentacoes.clear();
        const gastos = await db.gastos.toArray();
        for (const g of gastos) {
          const competencias = g.mesAno === 'fixo' ? (g.pagos || []) : (g.pago ? [g.mesAno] : []);
          for (const comp of competencias) {
            if (!/^\d{2}\/\d{4}$/.test(String(comp || ''))) continue;
            const mov = MovimentacaoService.montarDeGasto(g, comp, MovimentacaoService.dataDoGasto(g, comp));
            const existente = await db.movimentacoes.where('chaveOrigem').equals(mov.chaveOrigem).first();
            if (existente) await db.movimentacoes.update(existente.id, { ...mov, atualizadoEm: new Date().toISOString() });
            else await db.movimentacoes.add({ ...mov, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
          }
        }
        const acordos = await db.acordos.toArray();
        for (const acordo of acordos) {
          const hist = [...(acordo.historicoPagamentos || [])];
          let alterou = false;
          for (let i = 0; i < hist.length; i++) {
            if (!hist[i].pagamentoId) { hist[i].pagamentoId = `import-${acordo.id}-${i + 1}`; alterou = true; }
            if (Number(hist[i].parcela || 0) > 0 && !hist[i].competencia) {
              const venc = u.dataVencimentoParcela(acordo, hist[i].parcela);
              if (venc) hist[i].competencia = u.dateParaMesAno(venc);
            }
            if (!hist[i].data && Number(hist[i].parcela || 0) > 0) {
              const venc = u.dataVencimentoParcela(acordo, hist[i].parcela);
              if (venc) hist[i].data = u.formatarDataDate(venc);
            }
            const mov = MovimentacaoService.montarDeAcordo(acordo, hist[i]);
            const existente = await db.movimentacoes.where('chaveOrigem').equals(mov.chaveOrigem).first();
            if (existente) await db.movimentacoes.update(existente.id, { ...mov, atualizadoEm: new Date().toISOString() });
            else await db.movimentacoes.add({ ...mov, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
          }
          if (alterou) await db.acordos.update(acordo.id, { historicoPagamentos: hist });
        }
      }
    });
  },
};

export default FinanceiroService;
