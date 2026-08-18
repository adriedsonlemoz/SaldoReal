// src/services/MovimentacaoService.js
// Razão financeiro do SaldoReal.
// Esta é a única fonte para dinheiro efetivamente recebido/pago.

import db from '../db/db';
import u from '../utils/financeiro';

export const ORIGENS_MOVIMENTACAO = {
  manual:        { label: 'Manual',  emoji: '✍️' },
  lista_compras: { label: 'Compras', emoji: '🛒' },
  acordo:        { label: 'Acordo',  emoji: '🤝' },
  renda:         { label: 'Renda',   emoji: '💰' },
};

const numero = (valor) => {
  const n = Number(valor || 0);
  return Number.isFinite(n) ? n : 0;
};

const dataValida = (valor = new Date()) => {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;
  if (typeof valor === 'string') {
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }
  return new Date();
};

const isoLocal = (data) => u.dateParaISOInput(dataValida(data));
const competencia = (data) => u.dateParaMesAno(dataValida(data));

const dataDoGasto = (gasto, mesAno = gasto?.mesAno, referencia = new Date()) => {
  const mes = mesAno === 'fixo' ? u.mesAnoParaDate(u.dateParaMesAno(referencia)) : u.mesAnoParaDate(mesAno);
  if (!mes) return referencia;
  return u.dataVencimentoNoMes(gasto?.dia || 1, mes);
};

const origemDoGasto = (gasto) => {
  if (gasto?.origem === 'lista_compras' || gasto?.origemItemLista) return 'lista_compras';
  if (gasto?.tipoOperacao === 'entrada' && u.ehEntradaRendaBase(gasto)) return 'renda';
  return 'manual';
};

const chaveDoGasto = (gasto, mesAno) => {
  if (origemDoGasto(gasto) === 'lista_compras' && gasto.origemItemLista)
    return `lista:${gasto.origemItemLista}`;
  return `gasto:${gasto.id}:${mesAno}`;
};

const MovimentacaoService = {
  origemMeta(origem) {
    return ORIGENS_MOVIMENTACAO[origem] || { label: 'Outros', emoji: '•' };
  },

  dataValida,
  isoLocal,
  competencia,
  dataDoGasto,
  origemDoGasto,
  chaveDoGasto,

  async listarTodas() {
    return db.movimentacoes.orderBy('data').reverse().toArray();
  },

  async listarMes(mesAno) {
    return db.movimentacoes.where('mesFluxo').equals(mesAno).toArray();
  },

  async listarAntes(mesAno) {
    const alvo = u.mesAnoParaNum(mesAno);
    const todas = await db.movimentacoes.toArray();
    return todas.filter(m => u.mesAnoParaNum(m.mesFluxo || m.competencia) < alvo);
  },

  async buscarPorChave(chaveOrigem) {
    if (!chaveOrigem) return null;
    return db.movimentacoes.where('chaveOrigem').equals(chaveOrigem).first();
  },

  async upsert(dados) {
    if (!dados?.chaveOrigem) throw new Error('Movimentação sem chave de origem.');
    const existente = await this.buscarPorChave(dados.chaveOrigem);
    const data = dataValida(dados.data);
    const registro = {
      ...dados,
      tipo: dados.tipo === 'entrada' ? 'entrada' : 'despesa',
      valor: Math.max(0, numero(dados.valor)),
      data: isoLocal(data),
      mesFluxo: dados.mesFluxo || competencia(data),
      competencia: dados.competencia || competencia(data),
      status: dados.status || 'efetivada',
      categoria: dados.categoria || 'Outros',
      criadoEm: existente?.criadoEm || dados.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    if (existente) {
      await db.movimentacoes.update(existente.id, registro);
      return existente.id;
    }
    return db.movimentacoes.add(registro);
  },

  async removerPorChave(chaveOrigem) {
    const existente = await this.buscarPorChave(chaveOrigem);
    if (existente) await db.movimentacoes.delete(existente.id);
  },

  async removerPorOrigem(origem, origemId) {
    const itens = await db.movimentacoes.where('origem').equals(origem).toArray();
    const ids = itens.filter(m => String(m.origemId) === String(origemId)).map(m => m.id);
    if (ids.length) await db.movimentacoes.bulkDelete(ids);
  },

  montarDeGasto(gasto, mesAno, data = null) {
    const origem = origemDoGasto(gasto);
    const efetiva = dataValida(data || dataDoGasto(gasto, mesAno));
    const origemId = origem === 'lista_compras'
      ? (gasto.origemItemLista || gasto.id)
      : gasto.id;
    return {
      tipo: gasto.tipoOperacao === 'entrada' ? 'entrada' : 'despesa',
      valor: gasto.valor,
      data: isoLocal(efetiva),
      mesFluxo: competencia(efetiva),
      competencia: mesAno === 'fixo' ? competencia(efetiva) : mesAno,
      categoria: gasto.categoria || (gasto.tipoOperacao === 'entrada' ? 'Outros' : 'Geral'),
      descricao: gasto.nome || 'Lançamento',
      origem,
      origemId,
      entidadeId: gasto.id,
      referenciaId: gasto.id,
      chaveOrigem: chaveDoGasto(gasto, mesAno === 'fixo' ? competencia(efetiva) : mesAno),
      status: 'efetivada',
    };
  },

  montarDeAcordo(acordo, pagamento) {
    const pagamentoId = pagamento.pagamentoId;
    if (!pagamentoId) throw new Error('Pagamento de acordo sem ID.');
    const data = dataValida(pagamento.data);
    return {
      tipo: 'despesa',
      valor: pagamento.valorPago ?? acordo.valorParcela ?? 0,
      data: isoLocal(data),
      mesFluxo: competencia(data),
      competencia: pagamento.competencia || competencia(data),
      categoria: 'Acordos/Dívidas',
      descricao: acordo.empresa ? `🤝 ${acordo.empresa}` : '🤝 Acordo',
      origem: 'acordo',
      origemId: acordo.id,
      entidadeId: acordo.id,
      referenciaId: pagamentoId,
      chaveOrigem: `acordo:${acordo.id}:${pagamentoId}`,
      parcela: pagamento.parcela ?? null,
      status: 'efetivada',
    };
  },
};

export default MovimentacaoService;
