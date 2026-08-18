import { beforeEach, describe, expect, it, vi } from 'vitest';
import { calcularValorItem } from '../../src/components/listaCompras/constants.js';

const { dbMock, state } = vi.hoisted(() => {
  const state = { listas: [], itens: [], gastos: [], movimentacoes: [], nextGastoId: 1, nextMovId: 1 };

  const where = (storeName, field) => ({
    equals: (value) => ({
      toArray: async () => state[storeName].filter(x => x[field] === value).map(x => ({ ...x })),
      first: async () => {
        const found = state[storeName].find(x => x[field] === value);
        return found ? { ...found } : undefined;
      },
      delete: async () => {
        state[storeName] = state[storeName].filter(x => x[field] !== value);
      },
      modify: async (changes) => {
        state[storeName] = state[storeName].map(x => x[field] === value ? { ...x, ...changes } : x);
      },
    }),
  });

  const table = (storeName) => ({
    get: async (id) => {
      const found = state[storeName].find(x => x.id === id);
      return found ? { ...found } : undefined;
    },
    update: async (id, changes) => {
      state[storeName] = state[storeName].map(x => x.id === id ? { ...x, ...changes } : x);
      return 1;
    },
    delete: async (id) => {
      state[storeName] = state[storeName].filter(x => x.id !== id);
    },
    where: (field) => where(storeName, field),
  });

  const dbMock = {
    listas: {
      ...table('listas'),
      add: async (dados) => {
        const id = Math.max(0, ...state.listas.map(x => x.id || 0)) + 1;
        state.listas.push({ id, ...dados });
        return id;
      },
      orderBy: () => ({ reverse: () => ({ toArray: async () => [...state.listas].reverse() }) }),
    },
    itensLista: {
      ...table('itens'),
      add: async (dados) => {
        const id = Math.max(0, ...state.itens.map(x => x.id || 0)) + 1;
        state.itens.push({ id, ...dados });
        return id;
      },
    },
    gastos: {
      ...table('gastos'),
      add: async (dados) => {
        const id = state.nextGastoId++;
        state.gastos.push({ id, ...dados });
        return id;
      },
    },
    movimentacoes: {
      ...table('movimentacoes'),
      add: async (dados) => {
        const id = state.nextMovId++;
        state.movimentacoes.push({ id, ...dados });
        return id;
      },
    },
    transaction: async (_mode, ...args) => args.at(-1)(),
  };

  return { dbMock, state };
});

vi.mock('../../src/db/db.js', () => ({ default: dbMock }));

import ListaComprasService from '../../src/services/ListaComprasService.js';

describe('calcularValorItem()', () => {
  it('calcula 500 g usando preço por kg', () => {
    expect(calcularValorItem({ quantidade: 500, unidade: 'g', precoPorMedida: 35 })).toBeCloseTo(17.5);
  });

  it('calcula dúzias como 12 unidades', () => {
    expect(calcularValorItem({ quantidade: 2, unidade: 'dz', precoPorMedida: 1 })).toBe(24);
  });
});

describe('ListaComprasService — item pago integrado ao financeiro', () => {
  beforeEach(() => {
    state.listas = [{ id: 7, nome: 'Mercado', status: 'aberta', totalEstimado: 20, totalReal: 0 }];
    state.itens = [{
      id: 11, listaId: 7, nome: 'Arroz', categoria: 'Mercearia', status: 'pendente',
      quantidade: 1, unidade: 'un', precoPorMedida: 20, valorTotal: 20, valorTotalReal: null,
      gastoId: null,
    }];
    state.gastos = [];
    state.movimentacoes = [];
    state.nextGastoId = 1;
    state.nextMovId = 1;
  });

  it('lança o item no financeiro imediatamente ao pagar', async () => {
    const valor = await ListaComprasService.marcarComprado(11, 18.5);

    expect(valor).toBe(18.5);
    expect(state.gastos).toHaveLength(1);
    expect(state.gastos[0]).toMatchObject({
      nome: '🛒 Arroz', valor: 18.5, pago: true, tipoOperacao: 'despesa',
      origemLista: 7, origemItemLista: 11, origem: 'lista_compras',
    });
    expect(state.itens[0]).toMatchObject({ status: 'comprado', valorTotalReal: 18.5, gastoId: 1 });
    expect(state.movimentacoes).toHaveLength(1);
    expect(state.movimentacoes[0]).toMatchObject({
      origem: 'lista_compras', origemId: 11, entidadeId: 1,
      tipo: 'despesa', valor: 18.5, chaveOrigem: 'lista:11',
    });
    expect(state.listas[0].totalReal).toBe(18.5);
  });

  it('desfazer pagamento remove somente o lançamento daquele item', async () => {
    await ListaComprasService.marcarComprado(11, 18.5);
    await ListaComprasService.desmarcarComprado(11);

    expect(state.gastos).toHaveLength(0);
    expect(state.movimentacoes).toHaveLength(0);
    expect(state.itens[0]).toMatchObject({ status: 'pendente', valorTotalReal: null, gastoId: null });
    expect(state.listas[0].totalReal).toBe(0);
  });

  it('finalizar lista não duplica gastos já lançados', async () => {
    await ListaComprasService.marcarComprado(11, 18.5);
    const total = await ListaComprasService.concluirLista(7);

    expect(total).toBe(18.5);
    expect(state.gastos).toHaveLength(1);
    expect(state.movimentacoes).toHaveLength(1);
    expect(state.listas[0]).toMatchObject({ status: 'concluida', totalReal: 18.5 });
  });

  it('reabrir lista preserva o histórico financeiro', async () => {
    await ListaComprasService.marcarComprado(11, 18.5);
    await ListaComprasService.concluirLista(7);
    await ListaComprasService.reabrirLista(7);

    expect(state.gastos).toHaveLength(1);
    expect(state.movimentacoes).toHaveLength(1);
    expect(state.listas[0].status).toBe('aberta');
  });

  it('excluir a lista preserva despesas já pagas', async () => {
    await ListaComprasService.marcarComprado(11, 18.5);
    await ListaComprasService.excluirLista(7);

    expect(state.listas).toHaveLength(0);
    expect(state.itens).toHaveLength(0);
    expect(state.gastos).toHaveLength(1);
    expect(state.movimentacoes).toHaveLength(1);
  });
});
