const assert = require('node:assert/strict');
const { once } = require('node:events');
const { test } = require('node:test');
const express = require('express');
const rutasProductos = require('../src/routes/productos');
const { leerConfiguracion } = require('../src/db/supabase');

const url = 'https://supabase.invalid';
const usuarioId = '11111111-1111-4111-8111-111111111111';
const otroUsuarioId = '22222222-2222-4222-8222-222222222222';
const id = '33333333-3333-4333-8333-333333333333';
const idAjeno = '44444444-4444-4444-8444-444444444444';
const sku = '001-ABC';
const producto = { nombre: 'Tornillo', sku, cantidad: 0, minimo: 2 };
const fila = { ...producto, id, created_at: '2026-11-19T00:00:00Z' };

test('rutas de productos con Auth y Data API simuladas', async (t) => {
  const fetchLocal = global.fetch;
  const consultas = [];
  let respuestaDatos = [fila];
  let codigoDatos = 200;
  const filasEliminables = new Map([[id, usuarioId], [idAjeno, otroUsuarioId]]);
  t.mock.method(global, 'fetch', async (entrada, opciones) => {
    const destino = new URL(entrada);
    assert.equal(destino.origin, url);
    const autorizacion = new Headers(opciones.headers).get('Authorization');
    if (destino.pathname === '/auth/v1/user') {
      if (autorizacion === 'Bearer invalido') {
        return Response.json({ code: 'bad_jwt', message: 'Token inválido' }, { status: 401 });
      }
      return Response.json({
        id: autorizacion === 'Bearer usuario-b' ? otroUsuarioId : usuarioId,
        aud: 'authenticated',
        is_anonymous: autorizacion === 'Bearer anonimo',
      });
    }
    assert.equal(destino.pathname, '/rest/v1/productos');
    consultas.push({
      destino, autorizacion, metodo: opciones.method,
      body: opciones.body ? JSON.parse(opciones.body) : undefined,
      preferencia: new Headers(opciones.headers).get('Prefer'),
    });
    if (autorizacion === 'Bearer usuario-b') {
      assert.equal(destino.searchParams.get('user_id'), 'eq.' + otroUsuarioId);
      if (opciones.method === 'PATCH' || opciones.method === 'DELETE') {
        assert.equal(destino.searchParams.get('id'), 'eq.' + id);
        assert.equal(filasEliminables.get(id), usuarioId);
        return Response.json([]);
      }
      return Response.json([]);
    }
    if (opciones.method === 'DELETE' && codigoDatos === 200) {
      const filtroId = destino.searchParams.get('id')?.slice(3);
      const filtroUsuario = destino.searchParams.get('user_id');
      const propietario = filasEliminables.get(filtroId);
      if (!propietario || filtroUsuario !== 'eq.' + propietario) return Response.json([]);
      filasEliminables.delete(filtroId);
      return Response.json([{ id: filtroId }]);
    }
    if (opciones.method === 'GET') {
      const filas = [fila, { ...fila, id: '55555555-5555-4555-8555-555555555555' }];
      const offset = Number(destino.searchParams.get('offset'));
      return Response.json(filas.slice(offset, offset + 1));
    }
    return Response.json(respuestaDatos, { status: codigoDatos });
  });

  const app = express();
  app.use(express.json());
  app.use('/api/productos', rutasProductos({ url, clave: 'sb_publishable_ficticia' }));
  const servidor = app.listen(0, '127.0.0.1');
  try {
    await once(servidor, 'listening');
    const base = `http://127.0.0.1:${servidor.address().port}/api/productos`;
    const solicitar = (method, { ruta = '', datos, token = 'usuario' } = {}) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetchLocal(base + ruta, { method, headers, body: JSON.stringify(datos) });
    };

    for (const token of ['', 'invalido', 'anonimo']) {
      for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
        const ruta = ['PATCH', 'DELETE'].includes(method) ? '/' + id : '';
        const datos = ['POST', 'PATCH'].includes(method) ? producto : undefined;
        assert.equal((await solicitar(method, { token, ruta, datos })).status, 401);
      }
    }
    assert.equal(consultas.length, 0);

    const listado = await solicitar('GET');
    assert.equal(listado.status, 200);
    const listados = (await listado.json()).productos;
    assert.equal(listados.length, 2);
    assert.deepEqual(listados[0], fila);
    assert.deepEqual(consultas.map(({ destino }) => destino.searchParams.get('offset')), ['0', '1', '2']);
    assert.equal(consultas.at(-1).destino.searchParams.get('user_id'), 'eq.' + usuarioId);

    const invalidos = await solicitar('POST', { datos: { nombre: '   ', sku: 123, cantidad: -1, minimo: 1.5 } });
    assert.equal(invalidos.status, 400);
    assert.deepEqual(Object.keys((await invalidos.json()).campos), ['nombre', 'sku', 'cantidad', 'minimo']);
    const incompleto = await solicitar('PATCH', { ruta: '/' + id, datos: { ...producto, cantidad: '', minimo: 2147483648 } });
    assert.equal(incompleto.status, 400);
    assert.equal((await solicitar('PATCH', { ruta: '/invalido', datos: producto })).status, 404);
    assert.equal(consultas.length, 3);

    const listadoB = await solicitar('GET', { token: 'usuario-b' });
    assert.equal(listadoB.status, 200);
    assert.deepEqual(await listadoB.json(), { productos: [] });
    const intentoEdicionB = await solicitar('PATCH', {
      token: 'usuario-b', ruta: '/' + id, datos: { ...producto, cantidad: 99, user_id: usuarioId },
    });
    assert.equal(intentoEdicionB.status, 404);
    const intentoEliminarB = await solicitar('DELETE', { token: 'usuario-b', ruta: '/' + id });
    assert.equal(intentoEliminarB.status, 404);
    assert.deepEqual(consultas.slice(-3).map(({ autorizacion }) => autorizacion), [
      'Bearer usuario-b', 'Bearer usuario-b', 'Bearer usuario-b',
    ]);
    const despues = await solicitar('GET');
    assert.equal(despues.status, 200);
    assert.deepEqual((await despues.json()).productos, listados);

    codigoDatos = 201;
    const alta = await solicitar('POST', { datos: { ...producto, nombre: ' Tornillo ', sku: ' 001-ABC ', user_id: otroUsuarioId, id: otroUsuarioId } });
    assert.equal(alta.status, 201);
    assert.deepEqual(await alta.json(), { producto: fila });
    const altaEnviada = consultas.at(-1);
    assert.equal(altaEnviada.metodo, 'POST');
    assert.equal(altaEnviada.autorizacion, 'Bearer usuario');
    assert.deepEqual(altaEnviada.body, { ...producto, user_id: usuarioId });
    assert.match(altaEnviada.preferencia, /return=representation/);

    codigoDatos = 200;
    respuestaDatos = [{ ...fila, cantidad: 2 }];
    const edicion = await solicitar('PATCH', { ruta: '/' + id, datos: { ...producto, cantidad: 2, user_id: otroUsuarioId, created_at: 'ignorado' } });
    assert.equal(edicion.status, 200);
    assert.deepEqual(await edicion.json(), { producto: respuestaDatos[0] });
    const edicionEnviada = consultas.at(-1);
    assert.equal(edicionEnviada.metodo, 'PATCH');
    assert.equal(edicionEnviada.destino.searchParams.get('id'), 'eq.' + id);
    assert.equal(edicionEnviada.destino.searchParams.get('user_id'), 'eq.' + usuarioId);
    assert.equal(edicionEnviada.autorizacion, 'Bearer usuario');
    assert.deepEqual(edicionEnviada.body, { ...producto, cantidad: 2 });
    assert.match(edicionEnviada.preferencia, /return=representation/);

    respuestaDatos = [];
    assert.equal((await solicitar('PATCH', { ruta: '/' + id, datos: producto })).status, 404);

    codigoDatos = 409;
    respuestaDatos = { code: '23505', message: 'detalle interno simulado' };
    for (const method of ['POST', 'PATCH']) {
      const ruta = method === 'PATCH' ? '/' + id : '';
      const duplicado = await solicitar(method, { ruta, datos: { ...producto, sku: '001-abc' } });
      assert.equal(duplicado.status, 409);
      const resultado = await duplicado.json();
      assert.match(resultado.campos.sku, /SKU/);
      assert.doesNotMatch(JSON.stringify(resultado), /detalle interno/);
    }

    const aviso = t.mock.method(console, 'warn', () => {});
    codigoDatos = 403;
    respuestaDatos = { code: '42501', message: 'detalle privado simulado' };
    const prohibido = await solicitar('POST', { datos: producto });
    assert.equal(prohibido.status, 403);
    assert.doesNotMatch(JSON.stringify(await prohibido.json()), /detalle privado/);
    assert.deepEqual(aviso.mock.calls[0].arguments, [
      'Supabase: error de escritura de productos',
      { operacion: 'INSERT', codigo: '42501', estado: 403 },
    ]);

    respuestaDatos = { code: 'codigo que incluye datos privados', message: 'detalle privado' };
    const desconocido = await solicitar('POST', { datos: producto });
    assert.equal(desconocido.status, 502);
    assert.equal(aviso.mock.calls[1].arguments[1].codigo, 'NO_DISPONIBLE');

    const cantidadConsultas = consultas.length;
    assert.equal((await solicitar('DELETE', { ruta: '/invalido' })).status, 400);
    assert.equal(consultas.length, cantidadConsultas);

    codigoDatos = 200;
    const ajeno = await solicitar('DELETE', { ruta: '/' + idAjeno });
    assert.equal(ajeno.status, 404);
    assert.equal(filasEliminables.get(idAjeno), otroUsuarioId);

    codigoDatos = 403;
    respuestaDatos = { code: '42501', message: 'detalle privado' };
    const denegado = await solicitar('DELETE', { ruta: '/' + id });
    assert.equal(denegado.status, 403);
    assert.doesNotMatch(JSON.stringify(await denegado.json()), /detalle privado/);
    codigoDatos = 400;
    respuestaDatos = { code: 'PGRST100', message: 'detalle privado' };
    assert.equal((await solicitar('DELETE', { ruta: '/' + id })).status, 502);
    assert.equal(filasEliminables.get(id), usuarioId);

    codigoDatos = 200;
    const eliminado = await solicitar('DELETE', { ruta: '/' + id });
    assert.equal(eliminado.status, 204);
    assert.equal(await eliminado.text(), '');
    const enviado = consultas.at(-1);
    assert.equal(enviado.metodo, 'DELETE');
    assert.equal(enviado.autorizacion, 'Bearer usuario');
    assert.equal(enviado.destino.searchParams.get('id'), 'eq.' + id);
    assert.equal(enviado.destino.searchParams.get('user_id'), 'eq.' + usuarioId);
    assert.match(enviado.preferencia, /return=representation/);
    assert.equal(filasEliminables.has(id), false);
    const inexistente = await solicitar('DELETE', { ruta: '/' + id });
    assert.equal(inexistente.status, 404);
    assert.deepEqual(await inexistente.json(), await ajeno.json());
  } finally {
    servidor.close();
  }
});

test('la configuración acepta la URL base y rechaza rutas de otras API', (t) => {
  const anterior = { url: process.env.SUPABASE_URL, clave: process.env.SUPABASE_PUBLISHABLE_KEY };
  t.after(() => {
    for (const [variable, valor] of Object.entries({
      SUPABASE_URL: anterior.url, SUPABASE_PUBLISHABLE_KEY: anterior.clave,
    })) {
      if (valor === undefined) delete process.env[variable];
      else process.env[variable] = valor;
    }
  });
  process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ficticia';
  for (const ruta of ['/rest/v1/', '/auth/v1', '?a=b', '#fragmento']) {
    process.env.SUPABASE_URL = url + ruta;
    assert.equal(leerConfiguracion(), null);
  }
  process.env.SUPABASE_URL = url;
  assert.ok(leerConfiguracion());
});
