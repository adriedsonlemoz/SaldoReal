// ─────────────────────────────────────────────────────────────────────────────
// src/utils/financeiro.js
// Utilitário central de datas, parcelas e formatação monetária.
// ─────────────────────────────────────────────────────────────────────────────

const MS_DIA = 24 * 60 * 60 * 1000;

const FinanceiroUtils = {

  money(v) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(v || 0);
  },

  ehEntradaRendaBase(lancamento) {
    const categoria = String(lancamento?.categoria || '').trim().toLocaleLowerCase('pt-BR');
    return categoria === 'salário' || categoria === 'salario' || categoria === 'renda';
  },

  calcularResumoSaldo({
    rendaConfigurada = 0,
    rendaBaseRegistrada = 0,
    entradasExtrasPagas = 0,
    despesasPagas = 0,
    pendencias = 0,
  } = {}) {
    const rendaBase = Number(rendaBaseRegistrada || 0) > 0
      ? Number(rendaBaseRegistrada || 0)
      : Number(rendaConfigurada || 0);
    const receitaConsiderada = rendaBase + Number(entradasExtrasPagas || 0);
    const saldoDisponivel = receitaConsiderada - Number(despesasPagas || 0);
    const saldoProjetado = saldoDisponivel - Number(pendencias || 0);

    return { rendaBase, receitaConsiderada, saldoDisponivel, saldoProjetado };
  },

  // ── Datas ─────────────────────────────────────────────────────────────────

  dateParaMesAno(date) {
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  },

  dateParaISOInput(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  mesAnoParaNum(mesAno) {
    if (!mesAno || mesAno === 'fixo') return 999999;
    const [m, y] = mesAno.split('/');
    return parseInt(`${y}${m}`);
  },

  mesComOffset(offset = 0, referencia = new Date()) {
    return new Date(referencia.getFullYear(), referencia.getMonth() + offset, 1);
  },

  diasNoMes(ano, mesIndex) {
    return new Date(ano, mesIndex + 1, 0).getDate();
  },

  /**
   * Cria uma data local e limita o dia ao último dia real do mês.
   * Ex.: dia 31 em fevereiro/2026 vira 28/02/2026.
   */
  dataComDiaSeguro(ano, mesIndex, dia = 1) {
    const max = this.diasNoMes(ano, mesIndex);
    const diaSeguro = Math.min(Math.max(parseInt(dia) || 1, 1), max);
    return new Date(ano, mesIndex, diaSeguro);
  },

  dataVencimentoNoMes(dia, mesAlvo = new Date()) {
    return this.dataComDiaSeguro(mesAlvo.getFullYear(), mesAlvo.getMonth(), dia);
  },

  /** Converte YYYY-MM ou MM/YYYY em uma data no primeiro dia do mês. */
  mesAnoParaDate(valor) {
    if (!valor || typeof valor !== 'string') return null;

    let ano;
    let mes;
    if (/^\d{4}-\d{2}$/.test(valor)) {
      [ano, mes] = valor.split('-').map(Number);
    } else if (/^\d{2}\/\d{4}$/.test(valor)) {
      [mes, ano] = valor.split('/').map(Number);
    } else {
      return null;
    }

    if (mes < 1 || mes > 12) return null;
    return new Date(ano, mes - 1, 1);
  },

  /**
   * Mês de início das parcelas. Para dados novos, vencimentoMesAno é a fonte
   * oficial. Backups antigos continuam funcionando via dataAcordo.
   */
  inicioParcelamento(acordo) {
    if (!acordo || typeof acordo !== 'object') return null;

    const mesPrimeiroVencimento = this.mesAnoParaDate(acordo.vencimentoMesAno);
    if (mesPrimeiroVencimento) return mesPrimeiroVencimento;

    if (acordo.dataAcordo && /^\d{4}-\d{2}-\d{2}$/.test(acordo.dataAcordo)) {
      const [ano, mes, diaAcordo] = acordo.dataAcordo.split('-').map(Number);
      if (mes >= 1 && mes <= 12) {
        const diaVencimento = parseInt(acordo.vencimentoDia) || 1;
        const offset = diaVencimento < diaAcordo ? 1 : 0;
        return new Date(ano, mes - 1 + offset, 1);
      }
    }

    return null;
  },

  /**
   * Data real da Nª parcela, respeitando o dia de vencimento e meses curtos.
   */
  dataVencimentoParcela(acordo, numeroParcela = 1) {
    const inicio = this.inicioParcelamento(acordo);
    if (!inicio) return null;

    const numero = Math.max(1, parseInt(numeroParcela) || 1);
    const mes = new Date(inicio.getFullYear(), inicio.getMonth() + numero - 1, 1);
    return this.dataComDiaSeguro(mes.getFullYear(), mes.getMonth(), acordo.vencimentoDia || 1);
  },

  /**
   * Próxima parcela ainda não paga. Quando há histórico, preserva a identidade
   * das parcelas (um estorno da 1 não transforma a parcela 2 em parcela 1).
   */
  proximaParcelaPendente(acordo) {
    if (!acordo || acordo.situacao !== 'acordo') return null;
    const totais = Math.max(0, parseInt(acordo.parcelas) || 0);
    if (!totais) return null;

    const historico = Array.isArray(acordo.historicoPagamentos) ? acordo.historicoPagamentos : [];
    const pagos = new Set(
      historico.map(h => parseInt(h.parcela) || 0).filter(parcela => parcela > 0),
    );

    // Backups antigos podem ter apenas parcelasPagas, sem histórico detalhado.
    if (pagos.size === 0) {
      const quantidade = Math.min(totais, Math.max(0, parseInt(acordo.parcelasPagas) || 0));
      for (let numero = 1; numero <= quantidade; numero += 1) pagos.add(numero);
    }

    let numero = null;
    for (let i = 1; i <= totais; i += 1) {
      if (!pagos.has(i)) { numero = i; break; }
    }
    if (!numero) return null;

    const data = this.dataVencimentoParcela(acordo, numero);
    return data ? { numero, data } : null;
  },

  /** Diferença inteira em dias, imune a horário de verão/fuso. */
  diferencaDias(dataAlvo, referencia = new Date()) {
    if (!(dataAlvo instanceof Date) || Number.isNaN(dataAlvo.getTime())) return null;
    const a = Date.UTC(dataAlvo.getFullYear(), dataAlvo.getMonth(), dataAlvo.getDate());
    const b = Date.UTC(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
    return Math.round((a - b) / MS_DIA);
  },

  /** Próxima ocorrência mensal de um dia, inclusive hoje. */
  proximoVencimentoMensal(dia, referencia = new Date()) {
    let alvo = this.dataVencimentoNoMes(dia, referencia);
    if (this.diferencaDias(alvo, referencia) < 0) {
      const proximoMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1);
      alvo = this.dataVencimentoNoMes(dia, proximoMes);
    }
    return alvo;
  },

  /**
   * Quantas parcelas deveriam existir até o mês alvo.
   * Aceita a data ISO legada ou o objeto do acordo completo.
   */
  parcelasEsperadas(inicioOuAcordo, mesAlvo) {
    let inicio = null;

    if (inicioOuAcordo && typeof inicioOuAcordo === 'object' && !(inicioOuAcordo instanceof Date)) {
      inicio = this.inicioParcelamento(inicioOuAcordo);
    } else if (typeof inicioOuAcordo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inicioOuAcordo)) {
      const [ano, mes] = inicioOuAcordo.split('-').map(Number);
      inicio = new Date(ano, mes - 1, 1);
    }

    if (!inicio) return 1;
    return (
      (mesAlvo.getFullYear() - inicio.getFullYear()) * 12 +
      (mesAlvo.getMonth() - inicio.getMonth()) + 1
    );
  },

  temParcelaNesteMes(acordo, mesAlvo) {
    return this.quantidadeParcelasDevidasAteMes(acordo, mesAlvo) > 0;
  },

  parcelaPagaNesteMes(acordo, mesAnoTarget) {
    return (acordo.historicoPagamentos || [])
      .some(h => h.data && h.data.endsWith(mesAnoTarget));
  },

  quantidadeParcelasDevidasAteMes(acordo, mesAlvo) {
    if (!acordo || acordo.situacao !== 'acordo') return 0;
    const totais = Math.max(1, parseInt(acordo.parcelas) || 1);
    const esperadas = this.parcelasEsperadas(acordo, mesAlvo);
    if (esperadas <= 0) return 0;
    const limite = Math.min(totais, esperadas);
    const alvoNum = this.mesAnoParaNum(this.dateParaMesAno(mesAlvo));
    const historico = Array.isArray(acordo.historicoPagamentos) ? acordo.historicoPagamentos : [];
    const pagos = new Set();

    historico.forEach(h => {
      const parcela = parseInt(h.parcela) || 0;
      if (parcela <= 0 || !h.data) return;
      const partes = String(h.data).split('/');
      if (partes.length !== 3) return;
      const mesPagamento = Number(`${partes[2]}${partes[1]}`);
      if (mesPagamento <= alvoNum) pagos.add(parcela);
    });

    const temHistoricoRegular = historico.some(h => (parseInt(h.parcela) || 0) > 0);
    if (!temHistoricoRegular) {
      const quantidade = Math.min(limite, Math.max(0, parseInt(acordo.parcelasPagas) || 0));
      for (let numero = 1; numero <= quantidade; numero += 1) pagos.add(numero);
    }

    let devidas = 0;
    for (let numero = 1; numero <= limite; numero += 1) {
      if (!pagos.has(numero)) devidas += 1;
    }
    return devidas;
  },

  valorDevidoNoMes(acordo, mesAlvo) {
    const qtd = this.quantidadeParcelasDevidasAteMes(acordo, mesAlvo);
    return qtd * Number(acordo?.valorParcela || 0);
  },

  nomeMesOffset(offset, curto = false) {
    if (offset === 0) return curto ? 'Este Mês' : 'ESTE MÊS';
    const nomes = curto
      ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      : ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const d = this.mesComOffset(offset);
    const ano = curto ? String(d.getFullYear()).slice(-2) : d.getFullYear();
    return `${nomes[d.getMonth()]}/${ano}`;
  },

  formatarDataInput(dataStr) {
    if (!dataStr) return '—';
    return dataStr.split('-').reverse().join('/');
  },

  formatarDataDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  },

  calcularDataTermino(acordo) {
    const totais = parseInt(acordo?.parcelas) || 0;
    if (!totais) return '—';
    const fim = this.dataVencimentoParcela(acordo, totais);
    if (!fim) return '—';
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[fim.getMonth()]}/${fim.getFullYear()}`;
  },

  calcularTempoAberto(dataStr) {
    if (!dataStr) return '—';
    const inicio = new Date(dataStr + 'T00:00:00');
    const hoje = new Date();
    const meses = (hoje.getFullYear() - inicio.getFullYear()) * 12 + (hoje.getMonth() - inicio.getMonth());
    if (meses < 12) return `${meses} meses`;
    const anos = Math.floor(meses / 12);
    const resto = meses % 12;
    return resto > 0 ? `${anos} ano(s) e ${resto} mês(es)` : `${anos} ano(s)`;
  },

  verificarPrescricao(dataStr) {
    if (!dataStr) return false;
    const inicio = new Date(dataStr + 'T00:00:00');
    const hoje = new Date();
    const anos = (hoje.getFullYear() - inicio.getFullYear()) +
      (hoje.getMonth() - inicio.getMonth()) / 12;
    return anos >= 5;
  },
};

export default FinanceiroUtils;
