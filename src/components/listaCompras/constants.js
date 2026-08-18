// src/components/listaCompras/constants.js

export const CATEGORIAS = [
  { id: 'Carnes',      emoji: '🥩', label: 'Carnes',      cor: '#EF233C' },
  { id: 'Hortifruti',  emoji: '🥦', label: 'Hortifruti',  cor: '#06D6A0' },
  { id: 'Laticinios',  emoji: '🥛', label: 'Laticínios',  cor: '#00B4D8' },
  { id: 'Padaria',     emoji: '🍞', label: 'Padaria',     cor: '#FFB703' },
  { id: 'Bebidas',     emoji: '🥤', label: 'Bebidas',     cor: '#7B2CBF' },
  { id: 'Higiene',     emoji: '🧴', label: 'Higiene',     cor: '#F72585' },
  { id: 'Limpeza',     emoji: '🧹', label: 'Limpeza',     cor: '#4CC9F0' },
  { id: 'Mercearia',   emoji: '🛒', label: 'Mercearia',   cor: '#FB8500' },
  { id: 'Acougue',     emoji: '🔪', label: 'Açougue',     cor: '#D62828' },
  { id: 'Outros',      emoji: '📦', label: 'Outros',      cor: '#6B7280' },
];

// Unidades com fator de conversão relativo a 1 (unidade base)
// fator: quanto desta unidade = 1 unidade_base
// Permite calcular proporções: ex. 500g a R$35/kg = 0.5 * 35 = R$17.50
export const UNIDADES = [
  // ── Massa ────────────────────────────────────────────
  { id: 'un',  label: 'un',  grupo: 'Contagem', fator: 1,        base: 'un'  },
  { id: 'kg',  label: 'kg',  grupo: 'Massa',    fator: 1,        base: 'kg'  },
  { id: 'g',   label: 'g',   grupo: 'Massa',    fator: 0.001,    base: 'kg'  },
  { id: '500g',label: '500g',grupo: 'Massa',    fator: 0.5,      base: 'kg'  },
  // ── Volume ───────────────────────────────────────────
  { id: 'L',   label: 'L',   grupo: 'Volume',   fator: 1,        base: 'L'   },
  { id: 'ml',  label: 'ml',  grupo: 'Volume',   fator: 0.001,    base: 'L'   },
  { id: '500ml',label:'500ml',grupo:'Volume',   fator: 0.5,      base: 'L'   },
  // ── Embalagem ────────────────────────────────────────
  { id: 'cx',  label: 'cx',  grupo: 'Embalagem',fator: 1,        base: 'cx'  },
  { id: 'pct', label: 'pct', grupo: 'Embalagem',fator: 1,        base: 'pct' },
  { id: 'dz',  label: 'dz',  grupo: 'Contagem', fator: 12,       base: 'un'  },
];

export const CAT_MAP = Object.fromEntries(CATEGORIAS.map(c => [c.id, c]));

/** Formata valor como moeda brasileira */
export const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

/**
 * Calcula o valor total de um item considerando quantidade, unidade e preço por medida.
 * Ex: qty=500, unidade=g, precoPorMedida=35 (por kg) → fator=0.001 → 500 * 0.001 * 35 = R$17.50
 */
export function calcularValorItem({ quantidade, unidade, precoPorMedida }) {
  const uni = UNIDADES.find(u => u.id === unidade) || UNIDADES[0];
  return (parseFloat(quantidade) || 0) * uni.fator * (parseFloat(precoPorMedida) || 0);
}
