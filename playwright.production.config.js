const { defineConfig } = require('@playwright/test');

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
if (baseURL !== 'https://mini-inventario-hbr5.onrender.com') {
  throw new Error('La prueba de producción solo puede apuntar al Render autorizado.');
}

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/dia10-produccion.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90000,
  reporter: 'list',
  outputDir: 'test-results/dia10-production',
  use: {
    baseURL,
    browserName: 'chromium',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
});
