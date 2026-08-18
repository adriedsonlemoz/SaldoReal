import { beforeEach, describe, expect, it, vi } from 'vitest';

const { dbMock, state } = vi.hoisted(() => {
  const state = { acordos: [], movimentacoes: [], nextMovId: 10 };

  const dbMock = {
    acordos: {
      get: async (id) => {
        const item = state.acordos.find(a => a.id === id);
        return item ? structuredClone(item) : undefined;
      },
      update: async (id, changes) => {
        const idx = state.acordos.findIndex(a => a.id === id);
        if (idx >= 0) state.acordos[idx] = { ...state.acordos[idx], ...structuredClone(changes) };
        return idx >= 0 ? 1 : 0;
      },
    },
    movimentacoes: {
      add: async (dados) => {
        const id = state.nextMovId++;
        state.movimentacoes.push({ id, ...structuredClone(dados) });
        return id;
      },
      delete: async (id) => {
        state.movimentacoes = state.movimentacoes.filter(m => m.id !== id);
      },
      where: (field) => ({
        equals: (value) => ({
          first: async () => {
            const item = state.movimentacoes.find(m => m[field] === value);
            return item ? structuredClone(item) : undefined;
          },
          toArray: async () => state.movimentacoes.filter(m => m[field] === value).map(item => structuredClone(item)),
        }),
      }),
    },
    transaction: async (_mode, ...args) => args.at(-1)(),
  };

  return { dbMock, state };
});

vi.mock('../../src/db/db.js', () => ({ default: dbMock }));

import FinanceiroService from '../../src/services/FinanceiroService.js';

describe('Acordos — estorno individual no Razão', () => {
  beforeEach(() => {
    state.acordos = [{
      id: 1,
      empresa: 'Banco',
      situacao: 'acordo',
      vencimentoMesAno: '2026-07',
      vencimentoDia: 10,
      parcelas: 3,
      parcelasPagas: 1,
      valorParcela: 100,
      historicoPagamentos: [
        { pagamentoId: 'p2', parcela: 2, data: '05/08/2026', valorPago: 90, competencia: '08/2026' },
      ],
    }];
    state.movimentacoes = [{
      id: 5,
      tipo: 'despesa',
      valor: 90,
      data: '2026-08-05',
      mesFluxo: '08/2026',
      competencia: '08/2026',
      origem: 'acordo',
      origemId: 1,
      referenciaId: 'p2',
      chaveOrigem: 'acordo:1:p2',
      parcela: 2,
    }];
    state.nextMovId = 10;
  });

  it('paga primeiro a parcela que ficou faltando, sem renumerar a já paga', async () => {
    await FinanceiroService.registrarPagamentoAcordo(state.acordos[0], 1, '2026-08-18', 80);

    const regulares = state.acordos[0].historicoPagamentos.filter(h => h.parcela > 0);
    expect(regulares.map(h => h.parcela).sort()).toEqual([1, 2]);
    expect(regulares.find(h => h.parcela === 2)?.pagamentoId).toBe('p2');

    const nova = state.movimentacoes.find(m => m.parcela === 1);
    expect(nova).toMatchObject({
      valor: 80,
      mesFluxo: '08/2026',
      competencia: '07/2026',
      origem: 'acordo',
    });
  });

  it('estorna só o pagamento escolhido e preserva a identidade das demais parcelas', async () => {
    await FinanceiroService.registrarPagamentoAcordo(state.acordos[0], 1, '2026-08-18', 80);
    const parcela1 = state.acordos[0].historicoPagamentos.find(h => h.parcela === 1);

    await FinanceiroService.estornarPagamentoAcordo(1, parcela1.pagamentoId);

    expect(state.acordos[0].historicoPagamentos).toEqual([
      expect.objectContaining({ pagamentoId: 'p2', parcela: 2 }),
    ]);
    expect(state.acordos[0].parcelasPagas).toBe(1);
    expect(state.movimentacoes).toHaveLength(1);
    expect(state.movimentacoes[0]).toMatchObject({ chaveOrigem: 'acordo:1:p2', parcela: 2 });
  });
});
