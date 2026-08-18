import { defineConfig, devices } from '@playwright/test';

const LOCAL_URL = 'http://127.0.0.1:4173';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || LOCAL_URL;
const usarServidorLocal = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 1,
  fullyParallel: false,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: 'tests/reports/e2e' }],
  ],
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    storageState: undefined,
  },
  webServer: usarServidorLocal ? {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: LOCAL_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  } : undefined,
  projects: [
    {
      name: 'Chromium (Desktop)',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome (Android)',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
