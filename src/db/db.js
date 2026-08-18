// src/db/db.js
// ─────────────────────────────────────────────────────────────────────────────
// Dexie database — SaldoRealDB
//
// ATENÇÃO ao adicionar versões:
//   - Nunca modifique versões anteriores.
//   - Adicione sempre uma nova versão (incrementando o número).
//   - O upgrade() é obrigatório apenas se for necessário migrar dados existentes.
// ─────────────────────────────────────────────────────────────────────────────

import Dexie from 'dexie';

const db = new Dexie('SaldoRealDB');

// ── v7 ──────────────────────────────────────────────────────────────────────
db.version(7).stores({
  gastos:         '++id, mesAno, tipoOperacao',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
});

// ── v8 — Lista de Compras ────────────────────────────────────────────────────
db.version(8).stores({
  gastos:         '++id, mesAno, tipoOperacao',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
  listas:         '++id, nome, status, dataCriacao',
  itensLista:     '++id, listaId, status',
});

// ── v9 — índice origemLista em gastos ────────────────────────────────────────
db.version(9).stores({
  gastos:         '++id, mesAno, tipoOperacao, origemLista',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
  listas:         '++id, nome, status, dataCriacao',
  itensLista:     '++id, listaId, status',
});

// ── v10 — itensLista: novos campos de unidade e preço por medida ─────────────
// Campos adicionados: unidade, precoPorMedida, valorTotal, valorTotalReal
// (campos antigos valorEstimado e valorReal continuam a existir para
//  compatibilidade com itens criados nas versões anteriores)
db.version(10).stores({
  gastos:         '++id, mesAno, tipoOperacao, origemLista',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
  listas:         '++id, nome, status, dataCriacao',
  itensLista:     '++id, listaId, status',
}).upgrade(async (tx) => {
  // Migra itens antigos: preenche valorTotal a partir de valorEstimado * quantidade
  await tx.itensLista.toCollection().modify((item) => {
    if (item.valorTotal === undefined) {
      item.valorTotal = (item.valorEstimado || 0) * (item.quantidade || 1);
    }
    if (item.unidade === undefined) {
      item.unidade = 'un';
    }
    if (item.precoPorMedida === undefined) {
      item.precoPorMedida = item.valorEstimado || 0;
    }
  });
});


// ── v11 — normaliza o mês do primeiro vencimento dos acordos antigos ─────────
db.version(11).stores({
  gastos:         '++id, mesAno, tipoOperacao, origemLista',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
  listas:         '++id, nome, status, dataCriacao',
  itensLista:     '++id, listaId, status',
}).upgrade(async (tx) => {
  await tx.acordos.toCollection().modify((acordo) => {
    if (acordo.vencimentoMesAno || !acordo.dataAcordo) return;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(acordo.dataAcordo);
    if (!match) return;

    const ano = Number(match[1]);
    const mes = Number(match[2]);
    const diaAcordo = Number(match[3]);
    const diaVencimento = parseInt(acordo.vencimentoDia) || 1;
    const dataInicio = new Date(ano, mes - 1 + (diaVencimento < diaAcordo ? 1 : 0), 1);
    acordo.vencimentoMesAno = `${dataInicio.getFullYear()}-${String(dataInicio.getMonth() + 1).padStart(2, '0')}`;
  });
});


// ── v12 — vínculo item pago ↔ lançamento financeiro ────────────────────────
// Cada item pago da lista passa a ter um lançamento próprio no fluxo financeiro.
// O novo índice origemItemLista permite atualizar/desfazer o pagamento sem
// recriar toda a lista e sem apagar histórico ao reabrir.
db.version(12).stores({
  gastos:         '++id, mesAno, tipoOperacao, origemLista, origemItemLista',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
  listas:         '++id, nome, status, dataCriacao',
  itensLista:     '++id, listaId, status',
});

// ── v13 — Razão Financeiro único ─────────────────────────────────────────────
// A tabela movimentacoes passa a ser a fonte única do dinheiro que efetivamente
// entrou ou saiu. gastos/acordos continuam guardando compromissos, recorrências e
// regras de negócio; quando algo é pago/recebido, nasce uma movimentação vinculada.
const normalizarDataLegada = (valor, fallback = new Date()) => {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor;
  if (typeof valor === 'string') {
    let m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  return fallback;
};

const dataDeCompetencia = (mesAno, dia = 1) => {
  const m = /^(\d{2})\/(\d{4})$/.exec(String(mesAno || ''));
  if (!m) return new Date();
  const mes = Number(m[1]) - 1;
  const ano = Number(m[2]);
  const max = new Date(ano, mes + 1, 0).getDate();
  return new Date(ano, mes, Math.min(Math.max(Number(dia) || 1, 1), max));
};

const isoLocal = (data) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
const competenciaDaData = (data) => `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;

db.version(13).stores({
  gastos:         '++id, mesAno, tipoOperacao, origemLista, origemItemLista',
  acordos:        '++id, empresa, situacao',
  configuracoes:  'chave',
  listas:         '++id, nome, status, dataCriacao',
  itensLista:     '++id, listaId, status',
  movimentacoes:  '++id, data, mesFluxo, competencia, tipo, origem, origemId, referenciaId, categoria, &chaveOrigem',
}).upgrade(async (tx) => {
  const movimentos = [];

  // Gastos/entradas já liquidados em versões anteriores.
  const gastos = await tx.gastos.toArray();
  for (const gasto of gastos) {
    const origem = gasto.origem === 'lista_compras' || gasto.origemItemLista
      ? 'lista_compras'
      : (gasto.tipoOperacao === 'entrada' && ['salário', 'salario', 'renda'].includes(String(gasto.categoria || '').toLowerCase())
        ? 'renda'
        : 'manual');

    const adicionar = (competencia) => {
      const data = dataDeCompetencia(competencia, gasto.dia);
      const referencia = gasto.origemItemLista || gasto.id;
      const chave = origem === 'lista_compras'
        ? `lista:${referencia}`
        : `gasto:${gasto.id}:${competencia}`;
      movimentos.push({
        tipo: gasto.tipoOperacao === 'entrada' ? 'entrada' : 'despesa',
        valor: Number(gasto.valor || 0),
        data: isoLocal(data),
        mesFluxo: competencia,
        competencia,
        categoria: gasto.categoria || (gasto.tipoOperacao === 'entrada' ? 'Outros' : 'Geral'),
        descricao: gasto.nome || 'Lançamento',
        origem,
        origemId: referencia,
        entidadeId: gasto.id,
        referenciaId: gasto.id,
        chaveOrigem: chave,
        status: 'efetivada',
        criadoEm: new Date().toISOString(),
      });
    };

    if (gasto.mesAno === 'fixo') {
      for (const competencia of (gasto.pagos || [])) adicionar(competencia);
    } else if (gasto.pago && /^\d{2}\/\d{4}$/.test(String(gasto.mesAno || ''))) {
      adicionar(gasto.mesAno);
    }
  }

  // Pagamentos já existentes de acordos. Cada parcela ganha um pagamentoId
  // estável e uma movimentação própria, permitindo estorno individual.
  await tx.acordos.toCollection().modify((acordo) => {
    const historico = Array.isArray(acordo.historicoPagamentos) ? acordo.historicoPagamentos : [];
    historico.forEach((h, idx) => {
      if (!h.pagamentoId) h.pagamentoId = `legacy-${acordo.id}-${idx + 1}`;
      const parcela = Number(h.parcela || 0);
      let competencia = h.competencia || null;
      if (!competencia && parcela > 0) {
        const inicio = acordo.vencimentoMesAno && /^(\d{4})-(\d{2})$/.exec(acordo.vencimentoMesAno);
        if (inicio) {
          const base = new Date(Number(inicio[1]), Number(inicio[2]) - 1 + parcela - 1, 1);
          competencia = competenciaDaData(base);
        }
      }
      const dataFallback = competencia
        ? dataDeCompetencia(competencia, acordo.vencimentoDia || 1)
        : new Date();
      const data = h.data ? normalizarDataLegada(h.data, dataFallback) : dataFallback;
      competencia = competencia || competenciaDaData(data);
      if (!h.competencia) h.competencia = competencia;

      movimentos.push({
        tipo: 'despesa',
        valor: Number(h.valorPago ?? acordo.valorParcela ?? 0),
        data: isoLocal(data),
        mesFluxo: competenciaDaData(data),
        competencia,
        categoria: 'Acordos/Dívidas',
        descricao: acordo.empresa ? `🤝 ${acordo.empresa}` : '🤝 Acordo',
        origem: 'acordo',
        origemId: acordo.id,
        entidadeId: acordo.id,
        referenciaId: h.pagamentoId,
        chaveOrigem: `acordo:${acordo.id}:${h.pagamentoId}`,
        status: 'efetivada',
        parcela: h.parcela ?? null,
        criadoEm: new Date().toISOString(),
      });
    });
    acordo.historicoPagamentos = historico;
  });

  // Dados antigos podem conter duplicatas de uma mesma origem. Como chaveOrigem
  // é única no Razão, mantemos somente a última ocorrência para a migração não
  // impedir a abertura do banco.
  const unicos = Array.from(new Map(movimentos.map(m => [m.chaveOrigem, m])).values());
  if (unicos.length) await tx.movimentacoes.bulkAdd(unicos);
});

// ── Abertura segura ───────────────────────────────────────────────────────────
// Nunca apagamos o banco automaticamente. Em um app financeiro, uma falha de
// abertura deve preservar os dados para que o usuário ainda possa tentar
// recuperar/exportar o conteúdo ou corrigir o ambiente.
export const dbReady = db.open().catch((err) => {
  console.error('[SaldoRealDB] Erro ao abrir base de dados. Dados preservados:', err);

  // Permite que a interface/telemetria local reaja ao erro sem destruir dados.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('saldoreal:db-error', {
      detail: { message: err?.message || 'Falha ao abrir o banco local.' },
    }));
  }

  // Não relança aqui para evitar uma rejeição global não tratada. As operações
  // que dependem do banco continuarão retornando seus próprios erros.
  return null;
});

export default db;
