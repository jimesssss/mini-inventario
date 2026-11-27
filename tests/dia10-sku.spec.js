const { expect, test } = require('@playwright/test');
const { join } = require('node:path');

test('avisa de un SKU duplicado antes de enviar el formulario', async ({ page }) => {
  let altas = 0;
  const producto = {
    id: '33333333-3333-4333-8333-333333333333',
    nombre: 'Teclado',
    sku: '001-ABC',
    cantidad: 4,
    minimo: 1,
  };

  await page.route('**/api/configuracion', (route) => route.fulfill({
    json: { url: 'https://supabase.example.invalid', clave: 'sb_publishable_test' },
  }));
  await page.route('**/js/supabase.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.supabase={createClient:()=>({auth:{
      signInWithPassword:async()=>({data:{session:{access_token:'test-token'}},error:null}),
      getSession:async()=>({data:{session:{access_token:'test-token'}},error:null}),
      signOut:async()=>({error:null})
    }})};`,
  }));
  await page.route('**/api/productos', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { productos: [producto] } });
      return;
    }
    if (route.request().method() === 'POST') {
      altas += 1;
      await route.fulfill({
        status: 409,
        json: { error: 'Ya tienes un producto con ese SKU.', campos: { sku: 'Ya tienes un producto con ese SKU.' } },
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/');
  await page.getByLabel('Correo electrónico').fill('prueba@example.invalid');
  await page.getByLabel('Contraseña').fill('test-password');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Mis productos' })).toBeVisible();
  await page.getByRole('button', { name: 'Agregar producto' }).click();
  const formulario = page.locator('#formulario-producto');
  await formulario.locator('#nombre').fill('Otro teclado');
  await formulario.locator('#sku').fill(' 001-abc ');
  await formulario.locator('#cantidad').fill('2');
  await formulario.locator('#minimo').fill('1');
  await formulario.getByRole('button', { name: 'Guardar' }).click();

  await expect(page.locator('#error-sku')).toHaveText('Ya tienes un producto con ese SKU.');
  expect(altas).toBe(0);
  await page.screenshot({
    path: join(__dirname, '..', 'entregas', 'dia-10', 'evidencia-corregido.png'),
    fullPage: true,
  });
});
