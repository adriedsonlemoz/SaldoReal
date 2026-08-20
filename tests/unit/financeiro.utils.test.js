// tests/unit/financeiro.utils.test.js
// Testa toda a lógica pura de FinanceiroUtils — sem browser, sem banco de dados.

import { describe, it, expect } from 'vitest';
import u from '../../src/utils/financeiro.js';

// ─────────────────────────────────────────────────────────────────────────────
// Formatação de moeda
// ─────────────────────────────────────────────────────────────────────────────
describe('money()', () => {
  it('formata número positivo em reais', () => {
    expect(u.money(1234.56)).toContain('1.234,56');
  });
  it('formata zero', () => {
    expect(u.money(0)).toContain('0,00');
  });
  it('trata undefined como zero', () => {
    expect(u.money(undefined)).toContain('0,00');
  });
  it('formata valores negativos', () => {
    expect(u.money(-500)).toContain('500,00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Conversão de data → mesAno
// ─────────────────────────────────────────────────────────────────────────────
describe('dateParaMesAno()', () => {
  it('retorna MM/YYYY para data normal', () => {
    expect(u.dateParaMesAno(new Date(2026, 2, 15))).toBe('03/2026'); // mês 2 = março
  });
  it('padeia meses com zero à esquerda', () => {
    expect(u.dateParaMesAno(new Date(2026, 0, 1))).toBe('01/2026');
  });
  it('funciona em dezembro', () => {
    expect(u.dateParaMesAno(new Date(2025, 11, 31))).toBe('12/2025');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mesAnoParaNum — usado para comparar meses cronologicamente
// ─────────────────────────────────────────────────────────────────────────────
describe('mesAnoParaNum()', () => {
  it('converte 03/2026 para 202603', () => {
    expect(u.mesAnoParaNum('03/2026')).toBe(202603);
  });
  it('retorna 999999 para "fixo"', () => {
    expect(u.mesAnoParaNum('fixo')).toBe(999999);
  });
  it('retorna 999999 para null', () => {
    expect(u.mesAnoParaNum(null)).toBe(999999);
  });
  it('meses anteriores têm número menor que meses posteriores', () => {
    expect(u.mesAnoParaNum('01/2026')).toBeLessThan(u.mesAnoParaNum('02/2026'));
    expect(u.mesAnoParaNum('12/2025')).toBeLessThan(u.mesAnoParaNum('01/2026'));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parcelasEsperadas — quantas parcelas deveriam ter sido pagas até um mês
// ─────────────────────────────────────────────────────────────────────────────
describe('parcelasEsperadas()', () => {
  it('retorna 1 no próprio mês do acordo', () => {
    const resultado = u.parcelasEsperadas('2026-03-01', new Date(2026, 2, 1));
    expect(resultado).toBe(1);
  });
  it('retorna 2 no mês seguinte ao acordo', () => {
    const resultado = u.parcelasEsperadas('2026-03-01', new Date(2026, 3, 1));
    expect(resultado).toBe(2);
  });
  it('retorna 12 após 11 meses', () => {
    const resultado = u.parcelasEsperadas('2026-01-01', new Date(2026, 11, 1));
    expect(resultado).toBe(12);
  });
  it('retorna 0 antes do mês do acordo', () => {
    const resultado = u.parcelasEsperadas('2026-05-01', new Date(2026, 2, 1));
    expect(resultado).toBeLessThanOrEqual(0);
  });
  it('retorna 1 quando dataAcordo é null', () => {
    expect(u.parcelasEsperadas(null, new Date())).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// temParcelaNesteMes — usa situação de acordo + mês real do primeiro vencimento
// ─────────────────────────────────────────────────────────────────────────────
describe('temParcelaNesteMes()', () => {
  const acordoAtivo = {
    situacao: 'acordo',
    dataAcordo: '2026-03-01',
    vencimentoMesAno: '2026-03',
    vencimentoDia: 10,
    parcelas: 6,
    parcelasPagas: 0,
  };

  it('tem parcela no mês do acordo (início)', () => {
    expect(u.temParcelaNesteMes(acordoAtivo, new Date(2026, 2, 1))).toBe(true);
  });

  it('tem parcela no segundo mês', () => {
    expect(u.temParcelaNesteMes(acordoAtivo, new Date(2026, 3, 1))).toBe(true);
  });

  it('não tem parcela antes do acordo começar', () => {
    expect(u.temParcelaNesteMes(acordoAtivo, new Date(2026, 1, 1))).toBe(false);
  });

  it('não tem parcela depois de todas pagas', () => {
    const quitado = { ...acordoAtivo, parcelasPagas: 6 };
    expect(u.temParcelaNesteMes(quitado, new Date(2026, 3, 1))).toBe(false);
  });

  it('mantém parcelas vencidas pendentes mesmo após o prazo do acordo', () => {
    // O cronograma acabou em maio, mas parcelas não pagas continuam devidas em julho.
    const curto = { situacao: 'acordo', dataAcordo: '2026-03-01', vencimentoMesAno: '2026-03', vencimentoDia: 10, parcelas: 3, parcelasPagas: 0 };
    expect(u.temParcelaNesteMes(curto, new Date(2026, 6, 1))).toBe(true);
    expect(u.quantidadeParcelasDevidasAteMes(curto, new Date(2026, 6, 1))).toBe(3);
  });

  it('não tem parcela quando parcelasPagas alcança parcelas esperadas', () => {
    // 1 parcela esperada neste mês, mas já foi paga
    const parcialPago = { situacao: 'acordo', dataAcordo: '2026-03-01', vencimentoMesAno: '2026-03', vencimentoDia: 10, parcelas: 6, parcelasPagas: 1 };
    expect(u.temParcelaNesteMes(parcialPago, new Date(2026, 2, 1))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parcelaPagaNesteMes — verifica o histórico de pagamentos
// ─────────────────────────────────────────────────────────────────────────────
describe('parcelaPagaNesteMes()', () => {
  it('detecta pagamento registrado no mês alvo', () => {
    const acordo = {
      historicoPagamentos: [
        { data: '15/03/2026', valorPago: 100 },
      ],
    };
    expect(u.parcelaPagaNesteMes(acordo, '03/2026')).toBe(true);
  });

  it('não detecta pagamento de outro mês', () => {
    const acordo = {
      historicoPagamentos: [
        { data: '15/02/2026', valorPago: 100 },
      ],
    };
    expect(u.parcelaPagaNesteMes(acordo, '03/2026')).toBe(false);
  });

  it('retorna false quando histórico está vazio', () => {
    expect(u.parcelaPagaNesteMes({ historicoPagamentos: [] }, '03/2026')).toBe(false);
  });

  it('retorna false quando histórico é undefined', () => {
    expect(u.parcelaPagaNesteMes({}, '03/2026')).toBe(false);
  });

  it('funciona com data no formato DD/MM/YYYY', () => {
    const acordo = {
      historicoPagamentos: [{ data: '01/03/2026' }],
    };
    expect(u.parcelaPagaNesteMes(acordo, '03/2026')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// valorDevidoNoMes
// ─────────────────────────────────────────────────────────────────────────────
describe('valorDevidoNoMes()', () => {
  const mes = new Date(2026, 2, 1); // março 2026

  it('retorna valorParcela para acordo ativo no mês', () => {
    const acordo = {
      situacao: 'acordo',
      dataAcordo: '2026-03-01',
      parcelas: 6,
      parcelasPagas: 0,
      valorParcela: 250,
    };
    expect(u.valorDevidoNoMes(acordo, mes)).toBe(250);
  });

  it('retorna 0 para dívida vencida (não acordo)', () => {
    const acordo = {
      situacao: 'vencida',
      dataAcordo: '2026-03-01',
      parcelas: 6,
      parcelasPagas: 0,
      valorParcela: 250,
    };
    expect(u.valorDevidoNoMes(acordo, mes)).toBe(0);
  });

  it('retorna 0 quando todas as parcelas já foram pagas', () => {
    const acordo = {
      situacao: 'acordo',
      dataAcordo: '2026-03-01',
      parcelas: 6,
      parcelasPagas: 6,
      valorParcela: 250,
    };
    expect(u.valorDevidoNoMes(acordo, mes)).toBe(0);
  });

  it('retorna 0 quando não há parcela nesse mês', () => {
    // acordo começou em maio, então março não tem parcela
    const acordo = {
      situacao: 'acordo',
      dataAcordo: '2026-05-01',
      parcelas: 6,
      parcelasPagas: 0,
      valorParcela: 250,
    };
    expect(u.valorDevidoNoMes(acordo, mes)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verificarPrescricao
// ─────────────────────────────────────────────────────────────────────────────
describe('verificarPrescricao()', () => {
  it('retorna true para dívida com mais de 5 anos', () => {
    expect(u.verificarPrescricao('2018-01-01')).toBe(true);
  });
  it('retorna false para dívida recente', () => {
    expect(u.verificarPrescricao('2024-01-01')).toBe(false);
  });
  it('retorna false quando dataStr é null', () => {
    expect(u.verificarPrescricao(null)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calcularDataTermino
// ─────────────────────────────────────────────────────────────────────────────
describe('calcularDataTermino()', () => {
  it('calcula término de acordo de 12 parcelas a partir de janeiro', () => {
    const acordo = { dataAcordo: '2026-01-01', parcelas: 12 };
    expect(u.calcularDataTermino(acordo)).toBe('Dez/2026');
  });
  it('retorna — quando dataAcordo é vazio', () => {
    expect(u.calcularDataTermino({ dataAcordo: '', parcelas: 6 })).toBe('—');
  });
});

describe('quantidadeParcelasDevidasAteMes()', () => {
  it('acumula parcelas vencidas de meses anteriores', () => {
    const acordo = {
      situacao: 'acordo', vencimentoMesAno: '2026-06', vencimentoDia: 10,
      parcelas: 10, parcelasPagas: 1, valorParcela: 100,
    };
    expect(u.quantidadeParcelasDevidasAteMes(acordo, new Date(2026, 7, 1))).toBe(2);
    expect(u.valorDevidoNoMes(acordo, new Date(2026, 7, 1))).toBe(200);
  });
});
