const identificador = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

async function conLimpieza(usar, limpiar) {
  try {
    return await usar();
  } finally {
    await limpiar();
  }
}

async function limpiarProductoTemporal({ producto, id, listarDelPropietario, eliminarDelPropietario }) {
  const { sku } = producto;
  const coincideSku = (fila, esperado) => fila.sku?.toUpperCase() === esperado.toUpperCase();
  const filas = await listarDelPropietario();
  const candidatas = filas.filter((fila) => coincideSku(fila, sku) || (id && fila.id === id));
  if (!id && candidatas.length === 0) return null;

  const [fila] = candidatas;
  if (candidatas.length !== 1 || !identificador.test(fila?.id) || !fila.sku ||
      (id ? fila.id !== id : Object.entries(producto).some(([campo, valor]) => fila[campo] !== valor)) ||
      filas.filter((actual) => coincideSku(actual, fila.sku)).length !== 1) {
    throw new Error(`Limpieza detenida: identidad ambigua para SKU ${sku}.`);
  }

  await eliminarDelPropietario(fila.id);
  const restantes = await listarDelPropietario();
  if (restantes.some((actual) => actual.id === fila.id || coincideSku(actual, sku) || coincideSku(actual, fila.sku))) {
    throw new Error(`Limpieza no confirmada para SKU ${sku} | ID ${fila.id}.`);
  }
  return fila;
}

module.exports = { conLimpieza, identificador, limpiarProductoTemporal };
