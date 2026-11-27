const { defineConfig } = require('@playwright/test');
const { existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { loadEnvFile } = require('node:process');

const envFile = join(__dirname, '.env');
if (existsSync(envFile)) loadEnvFile(envFile);

const baseURL = 'http://localhost:3000';
const enCI = process.env.CI === 'true';

module.exports = defineConfig({
  testDir: './tests',
  testIgnore: '**/dia10-produccion.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: 'list',
  outputDir: join(tmpdir(), `mini-inventario-playwright-${process.pid}`),
  use: {
    baseURL,
    // Playwright administra Chromium en CI y usa Chrome instalado en local.
    ...(enCI ? { browserName: 'chromium' } : { channel: 'chrome' }),
    actionTimeout: 10000,
    navigationTimeout: 12000,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  webServer: {
    command: 'npm start',
    url: `${baseURL}/api/salud`,
    env: { PORT: '3000' },
    reuseExistingServer: !enCI,
    timeout: 30000,
  },
});
