// Helpers para campos monetários mobile-first.
// Regra: o usuário digita apenas os números e o valor é tratado como centavos.
// Ex.: 1990 -> 19,90. Isso evita depender da tecla de vírgula do teclado Android.

export const parseMoedaInput = (valor) => {
  const digitos = String(valor ?? '').replace(/\D/g, '');
  if (!digitos) return 0;
  const numero = Number(digitos) / 100;
  return Number.isFinite(numero) ? numero : 0;
};

export const formatMoedaInput = (valor, { comSimbolo = false, vazioZero = true } = {}) => {
  const numero = Number(valor || 0);
  if (vazioZero && !numero) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: comSimbolo ? 'currency' : 'decimal',
    currency: comSimbolo ? 'BRL' : undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numero);
};

export const propsInputMoeda = {
  inputMode: 'numeric',
  pattern: '[0-9]*',
  autoComplete: 'off',
};
