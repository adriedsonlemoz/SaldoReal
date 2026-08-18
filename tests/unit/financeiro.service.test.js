import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { dbMock, stores } = vi.hoisted(() => {
  const makeStore = () => ({
    toArray: vi.fn(),
    clear: vi.fn(),
    bulkPut: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkDelete: vi.fn(),
    where: vi.fn(() => ({
      equals: vi.fn(() => ({ first: vi.fn().mockResolvedValue(undefined), toArray: vi.fn().mockResolvedValue([]) })),
    })),
  });

  const stores = {
    gastos: makeStore(),
    acordos: makeStore(),
    configuracoes: makeStore(),
    listas: makeStore(),
    itensLista: makeStore(),
    movimentacoes: makeStore(),
  };

  const dbMock = {
    ...stores,
    transaction: vi.fn(async (_mode, ...args) => {
      const callback = args.at(-1);
      return callback();
    }),
  };

  return { dbMock, stores };
});

vi.mock('../../src/db/db.js', () => ({ default: dbMock }));

import FinanceiroService from '../../src/services/FinanceiroService.js';

describe('FinanceiroService — backup completo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stores.gastos.toArray.mockResolvedValue([{ id: 1, nome: 'Conta' }]);
    stores.acordos.toArray.mockResolvedValue([{ id: 2, empresa: 'Banco' }]);
    stores.configuracoes.toArray.mockResolvedValue([{ chave: 'renda', valor: 1000 }]);
    stores.listas.toArray.mockResolvedValue([{ id: 3, nome: 'Mercado' }]);
    stores.itensLista.toArray.mockResolvedValue([{ id: 4, listaId: 3 }]);
    stores.movimentacoes.toArray.mockResolvedValue([{ id: 5, tipo: 'despesa', valor: 10 }]);
  });

  it('exporta as seis tabelas no formato v3', async () => {
    const backup = await FinanceiroService.exportarTudo();
    expect(backup.app).toBe('SaldoReal');
    expect(backup.formatVersion).toBe(3);
    expect(Object.keys(backup.data).sort()).toEqual(
      ['acordos', 'configuracoes', 'gastos', 'itensLista', 'listas', 'movimentacoes'].sort(),
    );
  });

  it('restaura snapshot v3 dentro de uma transação', async () => {
    const data = {
      gastos: [{ id: 1 }],
      acordos: [{ id: 2 }],
      configuracoes: [{ chave: 'renda', valor: 900 }],
      listas: [{ id: 3 }],
      itensLista: [{ id: 4, listaId: 3 }],
      movimentacoes: [{ id: 5, tipo: 'despesa', valor: 20 }],
    };

    await FinanceiroService.importarTudo({ app: 'SaldoReal', formatVersion: 3, data });

    expect(dbMock.transaction).toHaveBeenCalledTimes(1);
    for (const [nome, registros] of Object.entries(data)) {
      expect(stores[nome].clear).toHaveBeenCalledTimes(1);
      expect(stores[nome].bulkPut).toHaveBeenCalledWith(registros);
    }
  });

  it('não apaga tabelas inexistentes ao importar backup legado', async () => {
    await FinanceiroService.importarTudo({ gastos: [{ id: 1 }] });
    expect(stores.gastos.clear).toHaveBeenCalledTimes(1);
    expect(stores.listas.clear).not.toHaveBeenCalled();
    expect(stores.itensLista.clear).not.toHaveBeenCalled();
  });

  it('rejeita backup de formato futuro', async () => {
    await expect(FinanceiroService.importarTudo({ formatVersion: 99, data: {} }))
      .rejects.toThrow('versão mais nova');
  });
});

describe('FinanceiroService — alertas por data real', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stores.movimentacoes.toArray.mockResolvedValue([]);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('alerta primeiro vencimento no mês seguinte sem cobrar antes', async () => {
    vi.setSystemTime(new Date(2026, 1, 26, 12)); // 26/02/2026
    stores.acordos.toArray.mockResolvedValue([{
      situacao: 'acordo', empresa: 'Banco', vencimentoMesAno: '2026-03', vencimentoDia: 1,
      parcelas: 3, parcelasPagas: 0, valorParcela: 200,
    }]);
    stores.gastos.toArray.mockResolvedValue([]);

    const alertas = await FinanceiroService.alertasDeVencimento(5);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].diff).toBe(3);
    expect(alertas[0].atrasado).toBe(false);
  });

  it('marca parcela antiga como atrasada', async () => {
    vi.setSystemTime(new Date(2026, 2, 10, 12)); // 10/03/2026
    stores.acordos.toArray.mockResolvedValue([{
      situacao: 'acordo', empresa: 'Banco', vencimentoMesAno: '2026-02', vencimentoDia: 28,
      parcelas: 3, parcelasPagas: 0, valorParcela: 200,
    }]);
    stores.gastos.toArray.mockResolvedValue([]);

    const [alerta] = await FinanceiroService.alertasDeVencimento(5);
    expect(alerta.atrasado).toBe(true);
    expect(alerta.diff).toBeLessThan(0);
  });

  it('trata gasto do dia 31 em fevereiro como vencendo no dia 28', async () => {
    vi.setSystemTime(new Date(2026, 1, 27, 12));
    stores.acordos.toArray.mockResolvedValue([]);
    stores.gastos.toArray.mockResolvedValue([{
      tipoOperacao: 'despesa', nome: 'Internet', mesAno: '02/2026', dia: 31, valor: 100, pago: false,
    }]);

    const [alerta] = await FinanceiroService.alertasDeVencimento(5);
    expect(alerta.dia).toBe(28);
    expect(alerta.diff).toBe(1);
  });
});

describe('FinanceiroService — acordos integrados ao fluxo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 18, 12));
    stores.gastos.toArray.mockResolvedValue([]);
    stores.movimentacoes.toArray.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inclui todas as parcelas vencidas e ainda não pagas nas pendências', async () => {
    stores.acordos.toArray.mockResolvedValue([{
      id: 1, situacao: 'acordo', empresa: 'Banco', vencimentoMesAno: '2026-07', vencimentoDia: 10,
      parcelas: 6, parcelasPagas: 0, valorParcela: 120, historicoPagamentos: [],
    }]);

    // Julho e agosto já deveriam estar pagos: 2 × R$120.
    await expect(FinanceiroService.debitoDoMes()).resolves.toBe(240);
  });

  it('relatório usa o valor realmente pago quando várias parcelas são quitadas no mês', async () => {
    stores.acordos.toArray.mockResolvedValue([{
      id: 2, situacao: 'acordo', empresa: 'Financeira', vencimentoMesAno: '2026-07', vencimentoDia: 5,
      parcelas: 6, parcelasPagas: 2, valorParcela: 100,
      historicoPagamentos: [
        { parcela: 1, data: '03/08/2026', valorPago: 85 },
        { parcela: 2, data: '03/08/2026', valorPago: 90 },
      ],
    }]);

    stores.movimentacoes.toArray.mockResolvedValue([
      { id: 10, origem: 'acordo', origemId: 2, tipo: 'despesa', valor: 85, mesFluxo: '08/2026', competencia: '07/2026' },
      { id: 11, origem: 'acordo', origemId: 2, tipo: 'despesa', valor: 90, mesFluxo: '08/2026', competencia: '08/2026' },
    ]);

    const relatorio = await FinanceiroService.dadosRelatorio(0);
    expect(relatorio.acordosPagos).toHaveLength(1);
    expect(relatorio.acordosPagos[0]).toMatchObject({ valorFluxo: 175, pagamentosMes: 2 });
    expect(relatorio.totalSaiPago).toBe(175);
  });

  it('um acordo pode ter pagamento no mês e ainda manter parcela atrasada pendente', async () => {
    stores.acordos.toArray.mockResolvedValue([{
      id: 3, situacao: 'acordo', empresa: 'Banco', vencimentoMesAno: '2026-06', vencimentoDia: 5,
      parcelas: 8, parcelasPagas: 1, valorParcela: 100,
      historicoPagamentos: [{ parcela: 1, data: '10/08/2026', valorPago: 80 }],
    }]);

    stores.movimentacoes.toArray.mockResolvedValue([
      { id: 12, origem: 'acordo', origemId: 3, tipo: 'despesa', valor: 80, mesFluxo: '08/2026', competencia: '06/2026' },
    ]);

    const relatorio = await FinanceiroService.dadosRelatorio(0);
    expect(relatorio.acordosPagos[0].valorFluxo).toBe(80);
    // Junho, julho e agosto deveriam estar pagos; só 1 foi pago => 2 ainda devidas.
    expect(relatorio.acordosPendentes[0]).toMatchObject({ parcelasDevidas: 2, valorFluxo: 200 });
  });
});
