// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Usa um ambiente de browser simulado para suportar APIs do DOM (Intl, etc.)
    environment: 'jsdom',
    // Mostra nome de cada teste individualmente no terminal
    reporter: 'verbose',
    // Arquivos de teste unitário
    include: ['tests/unit/**/*.test.js'],
    // Cobertura de código (opcional: npm run test:coverage)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**', 'src/services/**'],
    },
  },
});
