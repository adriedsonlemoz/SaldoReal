import { describe, expect, it } from 'vitest';
import { parseMoedaInput, formatMoedaInput } from '../../src/utils/moedaInput.js';

describe('entrada monetária no celular', () => {
  it('transforma apenas dígitos em centavos automaticamente', () => {
    expect(parseMoedaInput('1990')).toBe(19.9);
    expect(parseMoedaInput('3590')).toBe(35.9);
  });

  it('aceita valor já exibido com moeda e vírgula', () => {
    expect(parseMoedaInput('R$ 19,90')).toBe(19.9);
    expect(parseMoedaInput('1.234,56')).toBe(1234.56);
  });

  it('formata em padrão brasileiro sem exigir vírgula no teclado', () => {
    expect(formatMoedaInput(19.9)).toBe('19,90');
    expect(formatMoedaInput(1234.56)).toBe('1.234,56');
  });
});
