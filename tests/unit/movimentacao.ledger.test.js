import { describe, expect, it } from 'vitest';
import MovimentacaoService from '../../src/services/MovimentacaoService.js';

describe('Razão financeiro — competência x fluxo real', () => {
  it('mantém a competência da conta mesmo quando o pagamento acontece antes', () => {
    const movimento = MovimentacaoService.montarDeGasto({
      id: 4,
      nome: 'Energia',
      valor: 120,
      categoria: 'Casa',
      tipoOperacao: 'despesa',
      mesAno: '02/2026',
      dia: 10,
    }, '02/2026', new Date(2026, 0, 28));

    expect(movimento).toMatchObject({
      mesFluxo: '01/2026',
      competencia: '02/2026',
      origem: 'manual',
      chaveOrigem: 'gasto:4:02/2026',
    });
  });

  it('identifica compra da lista como origem própria no razão', () => {
    const movimento = MovimentacaoService.montarDeGasto({
      id: 8,
      origemItemLista: 31,
      origemLista: 7,
      nome: '🛒 Arroz',
      valor: 18.5,
      categoria: 'Mercado',
      tipoOperacao: 'despesa',
      mesAno: '08/2026',
      dia: 18,
    }, '08/2026', new Date(2026, 7, 18));

    expect(movimento).toMatchObject({
      origem: 'lista_compras',
      origemId: 31,
      entidadeId: 8,
      chaveOrigem: 'lista:31',
    });
  });

  it('usa a competência da parcela e o mês real do pagamento de acordo', () => {
    const movimento = MovimentacaoService.montarDeAcordo(
      { id: 9, empresa: 'Banco', valorParcela: 100 },
      { pagamentoId: 'abc', parcela: 2, data: '28/01/2026', valorPago: 85, competencia: '02/2026' },
    );

    expect(movimento).toMatchObject({
      origem: 'acordo',
      origemId: 9,
      valor: 85,
      mesFluxo: '01/2026',
      competencia: '02/2026',
      chaveOrigem: 'acordo:9:abc',
    });
  });
});
