const assert = require('node:assert/strict');
const { test } = require('node:test');
const { conLimpieza, limpiarProductoTemporal } = require('../tests/limpieza-producto-temporal');

const id = '00000000-0000-4000-8000-000000000001';
const otroId = '00000000-0000-4000-8000-000000000002';
const producto = { sku: 'PRUEBA-ORIGINAL', nombre: 'Sintético', cantidad: 2, minimo: 1 };

function inventarioControlado(filas) {
  const eliminados = [];
  return {
    eliminados,
    listarDelPropietario: async () => filas,
    eliminarDelPropietario: async (idTemporal) => {
      eliminados.push(idTemporal);
      filas = filas.filter((fila) => fila.id !== idTemporal);
    },
  };
}

test('limpia por ID tras una aserción fallida aunque cambie el SKU', async () => {
  const ajenoAlCaso = { ...producto, id: otroId, sku: 'OTRO-PRODUCTO' };
  const inventario = inventarioControlado([{ ...producto, id, sku: 'PRUEBA-EDITADO' }, ajenoAlCaso]);
  await assert.rejects(conLimpieza(
    async () => assert.fail('Aserción controlada'),
    () => limpiarProductoTemporal({ producto, id, ...inventario }),
  ), { name: 'AssertionError', message: 'Aserción controlada' });
  assert.deepEqual(inventario.eliminados, [id]);
  assert.deepEqual(await inventario.listarDelPropietario(), [ajenoAlCaso]);
});

test('recupera un alta sin ID solo si coincide todo el producto sintético', async () => {
  const fila = { ...producto, id };
  const inventario = inventarioControlado([fila]);
  assert.deepEqual(await limpiarProductoTemporal({ producto, ...inventario }), fila);
  assert.deepEqual(inventario.eliminados, [id]);
});

test('rechaza el borrado si el SKU y el ID confirmado apuntan a filas distintas', async () => {
  const inventario = inventarioControlado([
    { ...producto, id, sku: 'PRUEBA-EDITADO' },
    { ...producto, id: otroId },
  ]);
  await assert.rejects(limpiarProductoTemporal({ producto, id, ...inventario }), /identidad ambigua/);
  assert.deepEqual(inventario.eliminados, []);
});

test('rechaza el borrado sin ID si los datos sintéticos no coinciden', async () => {
  const inventario = inventarioControlado([{ ...producto, id, cantidad: 7 }]);
  await assert.rejects(limpiarProductoTemporal({ producto, ...inventario }), /identidad ambigua/);
  assert.deepEqual(inventario.eliminados, []);
});

test('rechaza el borrado sin ID si hay más de una coincidencia por SKU', async () => {
  const inventario = inventarioControlado([{ ...producto, id }, { ...producto, id: otroId }]);
  await assert.rejects(limpiarProductoTemporal({ producto, ...inventario }), /identidad ambigua/);
  assert.deepEqual(inventario.eliminados, []);
});

test('exige ausencia después del borrado por ID, SKU original y SKU encontrado', async () => {
  const fila = { ...producto, id, sku: 'PRUEBA-EDITADO' };
  for (const restante of [
    { ...fila, sku: 'OTRO-SKU' },
    { ...producto, id: otroId },
    { ...fila, id: otroId },
  ]) {
    const inventario = inventarioControlado([fila]);
    await assert.rejects(limpiarProductoTemporal({
      ...inventario,
      producto,
      id,
      listarDelPropietario: async () => inventario.eliminados.length ? [restante] : [fila],
    }), /Limpieza no confirmada/);
    assert.deepEqual(inventario.eliminados, [id]);
  }
});
