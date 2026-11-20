const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

function elemento() {
  const eventos = {};
  return {
    eventos, hidden: true, value: '', validity: { valid: true }, dataset: {},
    get valueAsNumber() { return this.value === '' ? NaN : Number(this.value); },
    addEventListener(tipo, fn) { eventos[tipo] = fn; },
    setAttribute() {},
    focus() {},
    append(...hijos) { this.hijos = hijos; },
  };
}

test('interfaz simulada: sesión, búsqueda, contador, alta, edición y eliminación', async () => {
  const elementos = new Map();
  const buscar = (id) => {
    if (!elementos.has(id)) elementos.set(id, elemento());
    return elementos.get(id);
  };
  const formulario = buscar('formulario-producto');
  formulario.elements = { namedItem: buscar };
  formulario.reset = () => {
    for (const campo of ['nombre', 'sku', 'cantidad', 'minimo']) buscar(campo).value = '';
  };
  buscar('inicio').reset = () => {};
  const filas = [];
  const tabla = buscar('productos');
  tabla.replaceChildren = () => { filas.length = 0; };
  tabla.insertRow = () => {
    const fila = {
      celdas: [],
      toggleAttribute(_atributo, valor) { this.resaltada = valor; },
      insertCell() { const celda = elemento(); this.celdas.push(celda); return celda; },
    };
    filas.push(fila);
    return fila;
  };

  let rechazarSesion = true;
  let duplicado = false;
  let confirmar = false;
  let falloEliminar = false;
  let confirmacion;
  const bajo = { id: 'bajo', nombre: 'Teclado', sku: '0002-Ab', cantidad: 0, minimo: 2 };
  const igual = { id: 'igual', nombre: 'Cable', sku: '003', cantidad: 2, minimo: 2 };
  const superior = { id: 'superior', nombre: 'Monitor', sku: '004', cantidad: 3, minimo: 2 };
  let inventarioSimulado = [bajo, igual, superior];
  const peticiones = [];
  const sesion = { access_token: 'token-ficticio' };
  const auth = {
    async signInWithPassword() {
      return rechazarSesion ? { data: { session: null }, error: {} } : { data: { session: sesion } };
    },
    async getSession() { return { data: { session: sesion } }; },
    async signOut() { return {}; },
  };
  vm.runInNewContext(readFileSync(join(__dirname, '../public/js/app.js'), 'utf8'), {
    document: { getElementById: buscar, createElement: elemento },
    window: {
      supabase: { createClient: () => ({ auth }) },
      confirm(texto) { confirmacion = texto; return confirmar; },
    },
    async fetch(ruta, opciones) {
      if (ruta === '/api/configuracion') return Response.json({});
      assert.equal(opciones.headers.Authorization, 'Bearer token-ficticio');
      if (!opciones.method) return Response.json({ productos: inventarioSimulado });
      const body = opciones.body ? JSON.parse(opciones.body) : undefined;
      peticiones.push({ ruta, metodo: opciones.method, body });
      if (opciones.method === 'DELETE') {
        if (falloEliminar) return Response.json({ error: 'No se pudo eliminar' }, { status: 502 });
        inventarioSimulado = inventarioSimulado.filter(({ id }) => !ruta.endsWith('/' + id));
        return new Response(null, { status: 204 });
      }
      if (duplicado) {
        return Response.json({ error: 'Duplicado', campos: { sku: 'SKU duplicado' } }, { status: 409 });
      }
      const producto = { ...body, id: 'producto-ficticio' };
      inventarioSimulado = opciones.method === 'POST'
        ? [producto, ...inventarioSimulado]
        : inventarioSimulado.map((actual) => actual.id === producto.id ? producto : actual);
      return Response.json({ producto });
    },
  });
  await new Promise(setImmediate);

  const evento = { preventDefault() {} };
  await buscar('inicio').eventos.submit(evento);
  assert.match(buscar('mensaje').textContent, /No se pudo iniciar/);
  rechazarSesion = false;
  await buscar('inicio').eventos.submit(evento);
  const contador = () => buscar('total-existencias-bajas').textContent;
  const filtrar = (valor) => {
    buscar('buscar-productos').value = valor;
    buscar('buscar-productos').eventos.input();
  };
  assert.match(contador(), /: 1$/);
  assert.equal(filas[0].celdas[4].textContent, 'Agotado');
  assert.equal(filas[1].celdas[4].textContent, 'Disponible');
  assert.equal(filas[1].resaltada, false);
  filtrar('MONI');
  assert.equal(filas.length, 1);
  assert.equal(filas[0].celdas[0].textContent, 'Monitor');
  filtrar('002-aB');
  assert.equal(filas.length, 1);
  assert.equal(filas[0].celdas[1].textContent, '0002-Ab');
  filtrar('0003');
  assert.equal(filas.length, 0);
  assert.equal(buscar('sin-coincidencias').hidden, false);
  assert.match(contador(), /: 1$/);
  buscar('limpiar-busqueda').eventos.click();
  assert.equal(filas.length, 3);
  assert.equal(buscar('sin-coincidencias').hidden, true);

  buscar('agregar').eventos.click();
  await formulario.eventos.submit(evento);
  assert.equal(peticiones.length, 0);
  assert.equal(buscar('error-nombre').hidden, false);
  Object.entries({ nombre: ' Mouse ', sku: ' 0001 ', cantidad: '5', minimo: '10' })
    .forEach(([campo, valor]) => { buscar(campo).value = valor; });
  await formulario.eventos.submit(evento);
  assert.deepEqual(peticiones[0], {
    ruta: '/api/productos',
    metodo: 'POST',
    body: { nombre: 'Mouse', sku: '0001', cantidad: 5, minimo: 10 },
  });
  assert.equal(filas[0].resaltada, true);
  assert.equal(filas[0].celdas[4].textContent, 'Existencias bajas');

  assert.match(contador(), /: 2$/);
  filas[0].celdas.at(-1).hijos[0].hijos[0].eventos.click();
  assert.equal(buscar('sku').value, '0001');
  buscar('cantidad').value = '11';
  duplicado = true;
  await formulario.eventos.submit(evento);
  assert.equal(buscar('error-sku').textContent, 'SKU duplicado');
  assert.equal(filas[0].celdas[2].textContent, 5);
  duplicado = false;
  await formulario.eventos.submit(evento);
  assert.equal(peticiones.at(-1).metodo, 'PATCH');
  assert.equal(peticiones.at(-1).ruta, '/api/productos/producto-ficticio');
  assert.equal(filas[0].resaltada, false);
  assert.equal(filas[0].celdas[4].textContent, 'Disponible');
  assert.match(contador(), /: 1$/);

  filtrar('0002');
  const botonEliminar = filas[0].celdas.at(-1).hijos[0].hijos[1];
  const eliminar = () => tabla.eventos.click({
    target: { closest: () => botonEliminar },
  });
  const antes = peticiones.length;
  await eliminar();
  assert.match(confirmacion, /Teclado.*0002-Ab/);
  assert.equal(peticiones.length, antes);
  assert.equal(filas.length, 1);
  confirmar = true;
  falloEliminar = true;
  await eliminar();
  assert.equal(buscar('mensaje').textContent, 'No se pudo eliminar');
  assert.equal(filas.length, 1);
  assert.match(contador(), /: 1$/);
  falloEliminar = false;
  await eliminar();
  assert.deepEqual(peticiones.at(-1), { ruta: '/api/productos/bajo', metodo: 'DELETE', body: undefined });
  assert.equal(filas.length, 0);
  assert.equal(buscar('sin-coincidencias').hidden, false);
  assert.match(contador(), /: 0$/);

  await buscar('salir').eventos.click();
  assert.equal(filas.length, 0);
  assert.equal(formulario.hidden, true);
  assert.equal(buscar('inicio').hidden, false);
  await buscar('inicio').eventos.submit(evento);
  assert.equal(filas.length, 3);
  assert.equal(filas.some((fila) => fila.celdas[1].textContent === bajo.sku), false);
  assert.match(contador(), /: 0$/);
});
