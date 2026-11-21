const { expect, test: base } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

const rutaProductos = '/api/productos';
const identificador = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
const origenLocal = 'http://localhost:3000';

base.beforeEach(async ({ page }) => {
  const { TEST_EMAIL, TEST_PASSWORD, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
  if (!TEST_EMAIL?.trim() || !TEST_PASSWORD?.trim()) {
    throw new Error('Configura TEST_EMAIL y TEST_PASSWORD para una cuenta dedicada de prueba.');
  }
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(SUPABASE_URL ?? '') ||
      !/^sb_publishable_[\w-]+$/.test(SUPABASE_PUBLISHABLE_KEY ?? '')) {
    throw new Error('La configuración de Supabase para la prueba no es válida.');
  }

  const respuesta = await page.request.get('/api/configuracion', { maxRedirects: 0 });
  if (!respuesta.ok()) throw new Error('Mini Inventario no devolvió su configuración.');
  const config = await respuesta.json();
  const origenSupabase = new URL(SUPABASE_URL).origin;
  if (new URL(config.url).origin !== origenSupabase || config.clave !== SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('El servidor local apunta a otra configuración de Supabase.');
  }
  await page.route('**/*', (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const permitido = url.origin === origenLocal ||
      (url.origin === origenSupabase && url.pathname === '/auth/v1/token' && request.method() === 'POST');
    return permitido ? route.continue() : route.abort();
  });
  await page.goto('/');
});

async function enviarCredenciales(page, contrasena) {
  const entrar = page.getByRole('button', { name: 'Iniciar sesión' });
  await expect(entrar).toBeEnabled();
  try {
    await page.locator('#correo').fill(process.env.TEST_EMAIL);
    await page.locator('#contrasena').fill(contrasena);
  } catch {
    throw new Error('No se pudieron introducir las credenciales de prueba.');
  }
  await entrar.click();
}

async function iniciarSesion(page) {
  const listado = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.origin === origenLocal && url.pathname === rutaProductos &&
      response.request().method() === 'GET';
  }, { timeout: 15000 });
  const [respuesta] = await Promise.all([listado, enviarCredenciales(page, process.env.TEST_PASSWORD)]);
  expect(respuesta.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Mis productos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar sesión' })).toBeVisible();
  const authorization = await respuesta.request().headerValue('authorization');
  if (!authorization?.startsWith('Bearer ')) throw new Error('No se confirmó una sesión autenticada.');
  return { authorization };
}

async function buscarPorSku(page, headers, sku) {
  const respuesta = await page.request.get(rutaProductos, { headers, maxRedirects: 0, timeout: 8000 });
  if (!respuesta.ok()) throw new Error(`No se pudo verificar el SKU de prueba (HTTP ${respuesta.status()}).`);
  const { productos } = await respuesta.json();
  return productos.filter((producto) => producto.sku.toUpperCase() === sku);
}

const test = base.extend({
  productoTemporal: [async ({ page }, use) => {
    const sku = `PRUEBA-D05-E2E-${randomUUID().toUpperCase()}`;
    let headers;
    let producto;
    let id;
    let intento = false;

    try {
      await use(async ({ nombre, cantidad, minimo }) => {
        headers = await iniciarSesion(page);
        if ((await buscarPorSku(page, headers, sku)).length !== 0) {
          throw new Error('El SKU de la prueba ya existía.');
        }
        producto = { nombre, sku, cantidad, minimo };
        await page.getByRole('button', { name: 'Agregar producto' }).click();
        for (const [campo, valor] of Object.entries(producto)) {
          await page.locator(`#formulario-producto #${campo}`).fill(String(valor));
        }
        console.log(`[alta prevista] SKU ${sku}`);
        const guardado = page.waitForResponse((response) => {
          const url = new URL(response.url());
          return url.origin === origenLocal && url.pathname === rutaProductos &&
            response.request().method() === 'POST';
        }, { timeout: 15000 });
        intento = true;
        const [respuesta] = await Promise.all([
          guardado,
          page.locator('#formulario-producto').getByRole('button', { name: 'Guardar' }).click(),
        ]);
        expect(respuesta.status()).toBe(201);
        const registrado = (await respuesta.json()).producto;
        if (registrado?.sku !== sku || !identificador.test(registrado?.id)) {
          throw new Error('El servidor no confirmó el identificador del producto sintético.');
        }
        id = registrado.id;
        console.log(`[creado] SKU ${sku} | ID ${id}`);
        await page.locator('#buscar-productos').fill(sku);
        const fila = page.locator('#productos tr').filter({ has: page.getByRole('cell', { name: sku, exact: true }) });
        await expect(fila.getByRole('cell', { name: nombre, exact: true })).toBeVisible();
        return fila;
      });
    } finally {
      if (intento) {
        // Si se perdió la respuesta del alta, solo recuperar la fila del SKU único y con todos los datos esperados.
        const filas = await buscarPorSku(page, headers, sku);
        if (filas.length === 0 && !id) {
          console.log(`[sin fila visible tras el intento] SKU ${sku}`);
        } else {
          const [fila] = filas;
          if (filas.length !== 1 || !identificador.test(fila?.id) || (id && fila.id !== id) ||
              Object.entries(producto).some(([campo, valor]) => fila[campo] !== valor)) {
            throw new Error(`Limpieza detenida: la fila no coincide con el producto de prueba ${sku}.`);
          }
          if (!id) console.log(`[recuperado] SKU ${sku} | ID ${fila.id}`);
          const eliminada = await page.request.delete(`${rutaProductos}/${fila.id}`, {
            headers, maxRedirects: 0, timeout: 8000,
          });
          if (eliminada.status() !== 204 || (await buscarPorSku(page, headers, sku)).length !== 0) {
            throw new Error(`Limpieza no confirmada para SKU ${sku} | ID ${fila.id}.`);
          }
          console.log(`[limpieza verificada] SKU ${sku} | ID ${fila.id} | filas restantes: 0`);
        }
      }
    }
  }, { timeout: 30000 }],
});

test('inicio de sesión válido', async ({ page }) => {
  await iniciarSesion(page);
});

test('contraseña incorrecta rechazada', async ({ page }) => {
  const contrasenaIncorrecta = `Incorrecta-${randomUUID()}`;
  await enviarCredenciales(page, contrasenaIncorrecta);
  await expect(page.locator('#mensaje')).toHaveText(
    'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.',
  );
  await expect(page.getByRole('heading', { name: 'Mis productos' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
});

test('agregar producto ficticio', async ({ productoTemporal }) => {
  const fila = await productoTemporal({ nombre: 'Producto automatizado Día 5', cantidad: 12, minimo: 4 });
  await expect(fila.getByRole('cell', { name: 'Disponible', exact: true })).toBeVisible();
});

test('detectar existencias bajas', async ({ productoTemporal }) => {
  const fila = await productoTemporal({ nombre: 'Existencias bajas automatizadas Día 5', cantidad: 3, minimo: 10 });
  await expect(fila.getByRole('cell', { name: 'Existencias bajas', exact: true })).toBeVisible();
  await expect(fila).toHaveAttribute('data-bajo-minimo', '');
});
