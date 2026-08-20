// tests/unit/logica.financeira.test.js
// Testa regras de negócio financeiras — sem browser, sem banco.
// Replica as funções críticas do FinanceiroService de forma isolada.

import { describe, it, expect } from 'vitest';
import u from '../../src/utils/financeiro.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers que replicam a lógica do FinanceiroService
// (testamos a lógica pura, sem depender do IndexedDB)
// ─────────────────────────────────────────────────────────────────────────────

function debitoDoMes(acordos, gastos, hoje = new Date()) {
  const mesAnoTarget = u.dateParaMesAno(hoje);

  const valorAcordos = acordos.reduce((acc, a) => {
    if (a.situacao !== 'acordo') return acc;
    if (!u.temParcelaNesteMes(a, hoje)) return acc;
    if (u.parcelaPagaNesteMes(a, mesAnoTarget)) return acc;
    return acc + (a.valorParcela || 0);
  }, 0);

  const valorGastos = gastos.reduce((acc, g) => {
    if (g.tipoOperacao !== 'despesa') return acc;
    const pertence = g.mesAno === 'fixo' || g.mesAno === mesAnoTarget;
    if (!pertence) return acc;
    const isPago = g.mesAno === 'fixo'
      ? (g.pagos || []).includes(mesAnoTarget)
      : !!g.pago;
    if (isPago) return acc;
    return acc + (g.valor || 0);
  }, 0);

  return valorAcordos + valorGastos;
}

function calcularSaldoRestante(renda, acordos, gastos, hoje = new Date()) {
  return u.calcularResumoSaldo({
    rendaConfigurada: renda,
    pendencias: debitoDoMes(acordos, gastos, hoje),
  }).saldoProjetado;
}

function registrarPagamento(acordo, qtd) {
  // replica registrarPagamentoAcordo sem o banco
  const hoje = new Date().toISOString().substr(0, 10).split('-').reverse().join('/');
  const historico = [...(acordo.historicoPagamentos || [])];
  for (let i = 1; i <= qtd; i++) {
    historico.push({
      parcela: parseInt(acordo.parcelasPagas || 0) + i,
      data: hoje,
      valorPago: acordo.valorParcela,
    });
  }
  const novasPagas = parseInt(acordo.parcelasPagas || 0) + parseInt(qtd);
  const situacao = novasPagas >= acordo.parcelas ? 'quitado' : acordo.situacao;
  return { ...acordo, parcelasPagas: novasPagas, historicoPagamentos: historico, situacao };
}

// ─────────────────────────────────────────────────────────────────────────────
// debitoDoMes
// ─────────────────────────────────────────────────────────────────────────────
describe('debitoDoMes()', () => {
  const hoje = new Date(2026, 7, 20); // 20/08/2026
  const mesAnoAtual = u.dateParaMesAno(hoje);
  const acordoAtual = {
    situacao: 'acordo',
    dataAcordo: '2026-08-10',
    vencimentoMesAno: '2026-08',
    vencimentoDia: 25,
    parcelas: 6,
    parcelasPagas: 0,
    historicoPagamentos: [],
  };

  it('conta acordo ativo não pago no mês', () => {
    const acordos = [{ ...acordoAtual, valorParcela: 300 }];
    expect(debitoDoMes(acordos, [], hoje)).toBe(300);
  });

  it('não conta acordo já pago neste mês', () => {
    const acordos = [{
      ...acordoAtual,
      parcelasPagas: 1,
      valorParcela: 300,
      historicoPagamentos: [{ parcela: 1, data: `01/${mesAnoAtual}`, valorPago: 300 }],
    }];
    expect(debitoDoMes(acordos, [], hoje)).toBe(0);
  });

  it('não conta acordo antes do mês do primeiro vencimento', () => {
    const fevereiro = new Date(2026, 1, 20);
    const acordos = [{
      situacao: 'acordo',
      dataAcordo: '2026-02-10',
      vencimentoMesAno: '2026-03',
      vencimentoDia: 5,
      parcelas: 6,
      parcelasPagas: 0,
      valorParcela: 300,
      historicoPagamentos: [],
    }];
    expect(debitoDoMes(acordos, [], fevereiro)).toBe(0);
  });

  it('não conta acordo com situação vencida', () => {
    const acordos = [{ ...acordoAtual, situacao: 'vencida', valorParcela: 300 }];
    expect(debitoDoMes(acordos, [], hoje)).toBe(0);
  });

  it('não conta acordo quitado', () => {
    const acordos = [{ ...acordoAtual, situacao: 'quitado', parcelasPagas: 6, valorParcela: 300 }];
    expect(debitoDoMes(acordos, [], hoje)).toBe(0);
  });

  it('conta gasto fixo não pago', () => {
    const gastos = [{ tipoOperacao: 'despesa', mesAno: 'fixo', valor: 150, pagos: [] }];
    expect(debitoDoMes([], gastos, hoje)).toBe(150);
  });

  it('não conta gasto fixo já pago no mês', () => {
    const gastos = [{ tipoOperacao: 'despesa', mesAno: 'fixo', valor: 150, pagos: [mesAnoAtual] }];
    expect(debitoDoMes([], gastos, hoje)).toBe(0);
  });

  it('não conta gasto de entrada como débito', () => {
    const gastos = [{ tipoOperacao: 'entrada', mesAno: mesAnoAtual, valor: 5000, pago: false }];
    expect(debitoDoMes([], gastos, hoje)).toBe(0);
  });

  it('soma múltiplos acordos e gastos', () => {
    const acordos = [
      { ...acordoAtual, valorParcela: 200 },
      { ...acordoAtual, parcelas: 3, valorParcela: 100 },
    ];
    const gastos = [{ tipoOperacao: 'despesa', mesAno: 'fixo', valor: 500, pagos: [] }];
    expect(debitoDoMes(acordos, gastos, hoje)).toBe(800);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcularSaldoRestante
// ─────────────────────────────────────────────────────────────────────────────
describe('calcularSaldoRestante()', () => {
  const hoje = new Date(2026, 7, 20);

  it('saldo = renda - débitos', () => {
    const acordos = [{
      situacao: 'acordo',
      dataAcordo: '2026-08-10',
      vencimentoMesAno: '2026-08',
      vencimentoDia: 25,
      parcelas: 6,
      parcelasPagas: 0,
      valorParcela: 500,
      historicoPagamentos: [],
    }];
    expect(calcularSaldoRestante(3000, acordos, [], hoje)).toBe(2500);
  });

  it('saldo cheio quando não há débitos', () => {
    expect(calcularSaldoRestante(5000, [], [], hoje)).toBe(5000);
  });

  it('saldo negativo quando débitos superam renda', () => {
    const gastos = [
      { tipoOperacao: 'despesa', mesAno: '08/2026', valor: 2000, pago: false },
    ];
    expect(calcularSaldoRestante(1000, [], gastos, hoje)).toBe(-1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pagamento de parcela — regra crítica que causava o bug de string concat
// ─────────────────────────────────────────────────────────────────────────────
describe('registrarPagamento() — sem bug de string concat', () => {
  it('parcelasPagas incrementa corretamente de 0 para 1', () => {
    const acordo = { parcelasPagas: 0, parcelas: 6, valorParcela: 300, situacao: 'acordo', historicoPagamentos: [] };
    const resultado = registrarPagamento(acordo, 1);
    expect(resultado.parcelasPagas).toBe(1);
    expect(typeof resultado.parcelasPagas).toBe('number');
  });

  it('parcelasPagas não concatena string — bug "2" + 1 = "21"', () => {
    // parcelasPagas vindo como string (como pode acontecer com dados antigos no IndexedDB)
    const acordo = { parcelasPagas: '2', parcelas: 6, valorParcela: 300, situacao: 'acordo', historicoPagamentos: [] };
    const resultado = registrarPagamento(acordo, 1);
    expect(resultado.parcelasPagas).toBe(3);    // correto: 2 + 1 = 3
    expect(resultado.parcelasPagas).not.toBe('21'); // bug antigo: '2' + 1 = '21'
  });

  it('muda situação para quitado quando última parcela é paga', () => {
    const acordo = { parcelasPagas: 5, parcelas: 6, valorParcela: 300, situacao: 'acordo', historicoPagamentos: [] };
    const resultado = registrarPagamento(acordo, 1);
    expect(resultado.situacao).toBe('quitado');
    expect(resultado.parcelasPagas).toBe(6);
  });

  it('pagar múltiplas parcelas de uma vez', () => {
    const acordo = { parcelasPagas: 0, parcelas: 6, valorParcela: 300, situacao: 'acordo', historicoPagamentos: [] };
    const resultado = registrarPagamento(acordo, 3);
    expect(resultado.parcelasPagas).toBe(3);
    expect(resultado.historicoPagamentos).toHaveLength(3);
    expect(resultado.situacao).toBe('acordo');
  });

  it('índice das parcelas no histórico é sequencial e correto', () => {
    const acordo = { parcelasPagas: '2', parcelas: 6, valorParcela: 300, situacao: 'acordo', historicoPagamentos: [] };
    const resultado = registrarPagamento(acordo, 2);
    expect(resultado.historicoPagamentos[0].parcela).toBe(3); // 2 + 1
    expect(resultado.historicoPagamentos[1].parcela).toBe(4); // 2 + 2
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Filtro da Carteira — bug de comparação string vs number
// ─────────────────────────────────────────────────────────────────────────────
describe('filtro de ativos/quitados — sem bug de comparação de strings', () => {
  const acordos = [
    { id: 1, situacao: 'acordo',  parcelasPagas: '0',  parcelas: '6'  }, // ativo
    { id: 2, situacao: 'acordo',  parcelasPagas: '6',  parcelas: '6'  }, // quitado (string!)
    { id: 3, situacao: 'quitado', parcelasPagas: '12', parcelas: '12' }, // quitado
    { id: 4, situacao: 'vencida', parcelasPagas: '0',  parcelas: '0'  }, // vencida
  ];

  const filtrarAtivos = (lista) =>
    lista.filter(a => a.situacao !== 'vencida' && parseInt(a.parcelasPagas || 0) < parseInt(a.parcelas || 0));

  const filtrarQuitados = (lista) =>
    lista.filter(a => a.situacao !== 'vencida' && parseInt(a.parcelasPagas || 0) >= parseInt(a.parcelas || 0));

  it('filtra ativos corretamente (com parseInt)', () => {
    const ativos = filtrarAtivos(acordos);
    expect(ativos.map(a => a.id)).toEqual([1]);
  });

  it('filtra quitados corretamente mesmo com parcelasPagas como string', () => {
    const quitados = filtrarQuitados(acordos);
    expect(quitados.map(a => a.id)).toContain(2);
    expect(quitados.map(a => a.id)).toContain(3);
  });

  it('sem parseInt — "9" < "10" retorna false (demonstração do bug antigo)', () => {
    // Este teste documenta o bug que existia antes da correção
    expect('9' < '10').toBe(false);  // comportamento errado de string
    expect(9  <  10 ).toBe(true);   // comportamento correto de number
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cálculo de economia (desconto)
// ─────────────────────────────────────────────────────────────────────────────
describe('calcularEconomia()', () => {
  const economia = (original, negociado) => {
    if (original <= 0 || negociado >= original) return 0;
    return (((original - negociado) / original) * 100).toFixed(0);
  };

  it('50% de desconto', () => {
    expect(economia(2000, 1000)).toBe('50');
  });
  it('sem desconto quando valores iguais', () => {
    expect(economia(1000, 1000)).toBe(0);
  });
  it('sem desconto quando original é zero', () => {
    expect(economia(0, 500)).toBe(0);
  });
  it('75% de desconto', () => {
    expect(economia(4000, 1000)).toBe('75');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cálculo do valor da parcela base
// ─────────────────────────────────────────────────────────────────────────────
describe('parcelaBase()', () => {
  const calcParcelaBase = ({ valorNegociado, entrada = 0, temEntrada = false, parcelas = 1 }) => {
    let base = parseFloat(valorNegociado) || 0;
    if (temEntrada) base -= parseFloat(entrada) || 0;
    const n = parseInt(parcelas) || 1;
    return base > 0 ? base / n : 0;
  };

  it('divide valor total por número de parcelas', () => {
    expect(calcParcelaBase({ valorNegociado: 1200, parcelas: 12 })).toBe(100);
  });
  it('desconta entrada antes de dividir', () => {
    expect(calcParcelaBase({ valorNegociado: 1200, parcelas: 11, temEntrada: true, entrada: 100 })).toBeCloseTo(100);
  });
  it('retorna 0 quando valor negociado é zero', () => {
    expect(calcParcelaBase({ valorNegociado: 0, parcelas: 6 })).toBe(0);
  });
  it('funciona com 1 parcela', () => {
    expect(calcParcelaBase({ valorNegociado: 500, parcelas: 1 })).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Resumo do dashboard — renda base sem contagem em dobro
// ─────────────────────────────────────────────────────────────────────────────
describe('resumo do dashboard — renda, pagos e pendências', () => {
  const resumo = ({ renda = 0, rendaBaseRegistrada = 0, entradasExtras = 0, despesasPagas = 0, pendencias = 0 }) =>
    u.calcularResumoSaldo({
      rendaConfigurada: renda,
      rendaBaseRegistrada,
      entradasExtrasPagas: entradasExtras,
      despesasPagas,
      pendencias,
    });

  it('não soma a renda configurada de novo quando o salário foi registrado manualmente', () => {
    expect(resumo({
      renda: 3000,
      rendaBaseRegistrada: 3000,
      despesasPagas: 500,
      pendencias: 700,
    })).toEqual({
      rendaBase: 3000,
      receitaConsiderada: 3000,
      saldoDisponivel: 2500,
      saldoProjetado: 1800,
    });
  });

  it('soma entradas extras à renda base', () => {
    expect(resumo({ renda: 3000, entradasExtras: 400, despesasPagas: 900, pendencias: 500 }))
      .toEqual({ rendaBase: 3000, receitaConsiderada: 3400, saldoDisponivel: 2500, saldoProjetado: 2000 });
  });

  it('separa saldo disponível do saldo projetado após pendências', () => {
    expect(resumo({ renda: 2000, despesasPagas: 600, pendencias: 900 }))
      .toEqual({ rendaBase: 2000, receitaConsiderada: 2000, saldoDisponivel: 1400, saldoProjetado: 500 });
  });
});
