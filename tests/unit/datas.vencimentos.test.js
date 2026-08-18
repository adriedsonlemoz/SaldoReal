import { describe, it, expect } from 'vitest';
import u from '../../src/utils/financeiro.js';

describe('datas seguras de vencimento', () => {
  it('formata data de input usando o calendário local', () => {
    expect(u.dateParaISOInput(new Date(2026, 7, 18, 23, 30))).toBe('2026-08-18');
  });

  it('limita dia 31 ao último dia de fevereiro não bissexto', () => {
    const d = u.dataComDiaSeguro(2026, 1, 31);
    expect(u.formatarDataDate(d)).toBe('28/02/2026');
  });

  it('preserva dia 29 em fevereiro de ano bissexto', () => {
    const d = u.dataComDiaSeguro(2028, 1, 29);
    expect(u.formatarDataDate(d)).toBe('29/02/2028');
  });

  it('limita dia 31 a 30 em abril', () => {
    const d = u.dataComDiaSeguro(2026, 3, 31);
    expect(u.formatarDataDate(d)).toBe('30/04/2026');
  });

  it('calcula diferença entre meses sem erro de virada', () => {
    const hoje = new Date(2026, 0, 30);
    const alvo = new Date(2026, 1, 2);
    expect(u.diferencaDias(alvo, hoje)).toBe(3);
  });
});

describe('primeiro vencimento e parcelas', () => {
  const acordo = {
    situacao: 'acordo',
    dataAcordo: '2026-02-10',
    vencimentoMesAno: '2026-03',
    vencimentoDia: 31,
    parcelas: 3,
    parcelasPagas: 0,
    valorParcela: 100,
  };

  it('usa vencimentoMesAno em vez da data de assinatura', () => {
    expect(u.parcelasEsperadas(acordo, new Date(2026, 1, 1))).toBe(0);
    expect(u.parcelasEsperadas(acordo, new Date(2026, 2, 1))).toBe(1);
  });

  it('não cobra parcela antes do primeiro vencimento', () => {
    expect(u.temParcelaNesteMes(acordo, new Date(2026, 1, 1))).toBe(false);
    expect(u.valorDevidoNoMes(acordo, new Date(2026, 1, 1))).toBe(0);
  });

  it('gera a data real da primeira parcela', () => {
    expect(u.formatarDataDate(u.dataVencimentoParcela(acordo, 1))).toBe('31/03/2026');
  });

  it('ajusta automaticamente uma parcela de dia 31 em abril', () => {
    expect(u.formatarDataDate(u.dataVencimentoParcela(acordo, 2))).toBe('30/04/2026');
  });

  it('identifica a próxima parcela pendente', () => {
    const proxima = u.proximaParcelaPendente({ ...acordo, parcelasPagas: 1 });
    expect(proxima.numero).toBe(2);
    expect(u.formatarDataDate(proxima.data)).toBe('30/04/2026');
  });

  it('mantém compatibilidade com acordos antigos sem vencimentoMesAno', () => {
    const antigo = { ...acordo, vencimentoMesAno: '', dataAcordo: '2026-05-10' };
    expect(u.formatarDataDate(u.dataVencimentoParcela(antigo, 1))).toBe('31/05/2026');
  });

  it('em acordo legado, joga o primeiro vencimento para o mês seguinte se o dia já passou', () => {
    const antigo = {
      ...acordo,
      vencimentoMesAno: '',
      dataAcordo: '2026-05-20',
      vencimentoDia: 10,
    };
    expect(u.formatarDataDate(u.dataVencimentoParcela(antigo, 1))).toBe('10/06/2026');
  });
});

describe('próximo vencimento mensal', () => {
  it('dia 31 em fevereiro vira o último dia do mês', () => {
    const hoje = new Date(2026, 1, 10);
    expect(u.formatarDataDate(u.proximoVencimentoMensal(31, hoje))).toBe('28/02/2026');
  });

  it('se a data deste mês passou, avança para o próximo mês', () => {
    const hoje = new Date(2026, 1, 28);
    expect(u.formatarDataDate(u.proximoVencimentoMensal(10, hoje))).toBe('10/03/2026');
  });

  it('considera hoje como vencimento válido', () => {
    const hoje = new Date(2026, 7, 18);
    expect(u.diferencaDias(u.proximoVencimentoMensal(18, hoje), hoje)).toBe(0);
  });
});

describe('estorno individual preserva a identidade da parcela', () => {
  const acordoComLacuna = {
    situacao: 'acordo',
    vencimentoMesAno: '2026-07',
    vencimentoDia: 10,
    parcelas: 4,
    parcelasPagas: 1,
    historicoPagamentos: [
      { pagamentoId: 'p2', parcela: 2, data: '05/08/2026', valorPago: 100 },
    ],
  };

  it('volta a apontar a parcela 1 quando a 2 continua paga', () => {
    expect(u.proximaParcelaPendente(acordoComLacuna)?.numero).toBe(1);
  });

  it('não usa uma parcela adiantada para esconder outra parcela vencida', () => {
    expect(u.quantidadeParcelasDevidasAteMes(acordoComLacuna, new Date(2026, 7, 18))).toBe(1);
  });
});

describe('histórico respeita o mês em que o pagamento aconteceu', () => {
  it('pagamento feito em agosto não transforma julho em quitado retroativamente', () => {
    const acordo = {
      situacao: 'acordo',
      vencimentoMesAno: '2026-07',
      vencimentoDia: 10,
      parcelas: 3,
      parcelasPagas: 1,
      historicoPagamentos: [{ pagamentoId: 'p1', parcela: 1, data: '05/08/2026', valorPago: 100 }],
    };
    expect(u.quantidadeParcelasDevidasAteMes(acordo, new Date(2026, 6, 20))).toBe(1);
    expect(u.quantidadeParcelasDevidasAteMes(acordo, new Date(2026, 7, 20))).toBe(1);
  });
});
