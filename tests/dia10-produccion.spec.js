const { expect, test } = require('@playwright/test');
const { randomUUID } = require('node:crypto');
const { limpiarProductoTemporal } = require('./limpieza-producto-temporal');

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
const origenApp = 'https://mini-inventario-hbr5.onrender.com';

if (baseURL !== origenApp) {
  throw new Error('La prueba de producción solo puede apuntar al Render autorizado.');
}

test('Render rechaza un SKU duplicado con sesión real antes del POST', async ({ page }, testInfo) => {
  const { TEST_EMAIL, TEST_PASSWORD, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
  if (!TEST_EMAIL?.trim() || !TEST_PASSWORD?.trim() ||
      !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Falta la configuración de prueba almacenada en GitHub Actions.');
  }

  const origenSupabase = new URL(SUPABASE_URL).origin;
  const configResponse = await page.request.get('/api/configuracion', { maxRedirects: 0 });
  if (!configResponse.ok()) throw new Error('Render no devolvió su configuración de Supabase.');
  const config = await configResponse.json();
  if (new URL(config.url).origin !== origenSupabase ||
      config.clave !== SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Render no está conectado al proyecto Supabase de prueba esperado.');
  }

  await page.route('**/*', (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const permitido = url.origin === origenApp ||
      (url.origin === origenSupabase && url.pathname === '/auth/v1/token' &&
        request.method() === 'POST');
    return permitido ? route.continue() : route.abort();
  });

  const producto = {
    nombre: 'Prueba automatizada Día 10',
    sku: `D10-E2E-${randomUUID().replaceAll('-', '').toUpperCase()}`,
    cantidad: 7,
    minimo: 2,
  };
  let authorization;
  let id;
  let intentoDeAlta = false;

  try {
    await page.goto('/');
    const listado = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.origin === origenApp && url.pathname === '/api/productos' &&
        response.request().method() === 'GET';
    }, { timeout: 20000 });
    await page.getByLabel('Correo electrónico').fill(TEST_EMAIL);
    await page.getByLabel('Contraseña').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    const respuestaListado = await listado;
    expect(respuestaListado.status()).toBe(200);
    authorization = await respuestaListado.request().headerValue('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new Error('No se confirmó una sesión de prueba autenticada.');
    }

    const { productos } = await respuestaListado.json();
    if (!Array.isArray(productos) ||
        productos.some((fila) => fila.sku?.toUpperCase() === producto.sku)) {
      throw new Error('No se pudo confirmar que el SKU sintético está disponible.');
    }

    await page.getByRole('button', { name: 'Agregar producto' }).click();
    const formulario = page.locator('#formulario-producto');
    for (const [campo, valor] of Object.entries(producto)) {
      await formulario.locator(`#${campo}`).fill(String(valor));
    }
    const alta = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.origin === origenApp && url.pathname === '/api/productos' &&
        response.request().method() === 'POST';
    }, { timeout: 20000 });
    intentoDeAlta = true;
    await formulario.getByRole('button', { name: 'Guardar' }).click();
    const respuestaAlta = await alta;
    const resultadoAlta = await respuestaAlta.json();
    id = resultadoAlta.producto?.id;
    expect(respuestaAlta.status()).toBe(201);
    expect(resultadoAlta.producto?.sku).toBe(producto.sku);
    await expect(formulario).toBeHidden();

    let altasDuplicadas = 0;
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin === origenApp && url.pathname === '/api/productos' &&
          request.method() === 'POST') {
        altasDuplicadas += 1;
      }
    });

    await page.getByRole('button', { name: 'Agregar producto' }).click();
    for (const [campo, valor] of Object.entries({
      ...producto,
      nombre: 'Intento duplicado Día 10',
      sku: producto.sku.toLowerCase(),
    })) {
      await formulario.locator(`#${campo}`).fill(String(valor));
    }
    await formulario.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('#error-sku')).toHaveText('Ya tienes un producto con ese SKU.');
    expect(altasDuplicadas).toBe(0);
    await formulario.screenshot({
      path: testInfo.outputPath('evidencia-render-autenticada.png'),
    });
  } finally {
    if (intentoDeAlta && authorization) {
      await limpiarProductoTemporal({
        producto,
        id,
        listarDelPropietario: async () => {
          const response = await page.request.get('/api/productos', {
            headers: { authorization },
            maxRedirects: 0,
            timeout: 15000,
          });
          if (response.status() !== 200) {
            throw new Error(`No se pudo verificar la limpieza del producto (HTTP ${response.status()}).`);
          }
          return (await response.json()).productos;
        },
        eliminarDelPropietario: async (idTemporal) => {
          const response = await page.request.delete(`/api/productos/${idTemporal}`, {
            headers: { authorization },
            maxRedirects: 0,
            timeout: 15000,
          });
          if (response.status() !== 204) {
            throw new Error(`No se confirmó la eliminación del producto temporal (HTTP ${response.status()}).`);
          }
        },
      });
    }
  }
});
