const inicio = document.getElementById('inicio');
const correo = document.getElementById('correo');
const contrasena = document.getElementById('contrasena');
const entrar = document.getElementById('entrar');
const salir = document.getElementById('salir');
const mensaje = document.getElementById('mensaje');
const inventario = document.getElementById('inventario');
const productos = document.getElementById('productos');
const resultados = document.getElementById('resultados');
const vacio = document.getElementById('vacio');
const buscador = document.getElementById('buscar-productos');
const limpiarBusqueda = document.getElementById('limpiar-busqueda');
const sinCoincidencias = document.getElementById('sin-coincidencias');
const totalExistenciasBajas = document.getElementById('total-existencias-bajas');
const agregar = document.getElementById('agregar');
const formulario = document.getElementById('formulario-producto');
const tituloProducto = document.getElementById('titulo-producto');
const camposProducto = document.getElementById('campos-producto');
const cancelarProducto = document.getElementById('cancelar-producto');
const campos = ['nombre', 'sku', 'cantidad', 'minimo'];
let listaProductos = [];
let productoEnEdicion = null;

function bajoMinimo({ cantidad, minimo }) {
  return cantidad < minimo;
}

function estadoProducto({ cantidad, minimo }) {
  if (cantidad === 0) return 'Agotado';
  return bajoMinimo({ cantidad, minimo }) ? 'Existencias bajas' : 'Disponible';
}

function mostrarProductos(lista) {
  listaProductos = lista;
  totalExistenciasBajas.textContent = `Productos por debajo del mínimo: ${lista.filter(bajoMinimo).length}`;
  renderizarListado();
}

function renderizarListado() {
  const consulta = buscador.value.trim().toLowerCase();
  const visibles = listaProductos.filter(({ nombre, sku }) =>
    nombre.toLowerCase().includes(consulta) || sku.toLowerCase().includes(consulta));
  productos.replaceChildren();
  for (const producto of visibles) {
    const fila = productos.insertRow();
    for (const valor of [producto.nombre, producto.sku, producto.cantidad, producto.minimo]) {
      fila.insertCell().textContent = valor;
    }
    const estado = estadoProducto(producto);
    const celda = fila.insertCell();
    celda.textContent = estado;
    celda.dataset.estado = estado;
    fila.toggleAttribute('data-bajo-minimo', bajoMinimo(producto));

    const editar = document.createElement('button');
    editar.type = 'button';
    editar.textContent = 'Editar';
    editar.setAttribute('aria-label', `Editar ${producto.nombre}`);
    editar.addEventListener('click', () => abrirFormulario(producto));
    const eliminar = document.createElement('button');
    eliminar.type = 'button';
    eliminar.className = 'eliminar-producto';
    eliminar.textContent = 'Eliminar';
    eliminar.setAttribute('aria-label', `Eliminar ${producto.nombre}`);
    eliminar.dataset.eliminarId = producto.id;

    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.append(editar, eliminar);
    fila.insertCell().append(acciones);
  }
  limpiarBusqueda.disabled = !buscador.value;
  vacio.hidden = Boolean(consulta) || listaProductos.length > 0;
  sinCoincidencias.hidden = !consulta || visibles.length > 0;
  resultados.hidden = visibles.length === 0;
}

function mostrarErrorCampo(campo, error = '') {
  const input = formulario.elements.namedItem(campo);
  const aviso = document.getElementById(`error-${campo}`);
  aviso.textContent = error;
  aviso.hidden = !error;
  input.setAttribute('aria-invalid', String(!aviso.hidden));
}

function mostrarErrores(camposInvalidos = {}) {
  for (const campo of campos) mostrarErrorCampo(campo, camposInvalidos[campo]);
  const primero = campos.find((campo) => camposInvalidos[campo]);
  if (primero) formulario.elements.namedItem(primero).focus();
}

function abrirFormulario(producto = null) {
  if (camposProducto.disabled || salir.disabled) return;
  productoEnEdicion = producto;
  formulario.reset();
  mostrarErrores();
  tituloProducto.textContent = producto ? 'Editar producto' : 'Agregar producto';
  if (producto) {
    for (const campo of campos) formulario.elements.namedItem(campo).value = producto[campo];
  }
  mensaje.textContent = '';
  formulario.hidden = false;
  formulario.elements.namedItem('nombre').focus();
}

function cerrarFormulario() {
  productoEnEdicion = null;
  formulario.reset();
  mostrarErrores();
  formulario.hidden = true;
}

function leerFormulario() {
  const datos = {};
  const errores = {};
  for (const campo of campos) {
    const input = formulario.elements.namedItem(campo);
    if (campo === 'nombre' || campo === 'sku') {
      datos[campo] = input.value.trim();
      if (!datos[campo] || datos[campo].includes('\0')) {
        errores[campo] = campo === 'sku' ? 'Escribe un SKU válido.' : 'Escribe un nombre válido.';
      }
    } else {
      datos[campo] = input.valueAsNumber;
      if (!input.validity.valid || !Number.isInteger(datos[campo])) {
        errores[campo] = 'Escribe un entero entre 0 y 2147483647.';
      }
    }
  }
  return { datos, errores };
}

async function iniciar() {
  const respuesta = await fetch('/api/configuracion');
  if (!respuesta.ok) {
    if (respuesta.status === 503) {
      mensaje.textContent = (await respuesta.json()).error;
      return;
    }
    throw new Error('Configuración no disponible');
  }
  const { url, clave } = await respuesta.json();
  const cliente = window.supabase.createClient(url, clave, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });

  buscador.addEventListener('input', renderizarListado);
  limpiarBusqueda.addEventListener('click', () => {
    buscador.value = '';
    renderizarListado();
    buscador.focus();
  });

  productos.addEventListener('click', async (evento) => {
    const id = evento.target.closest('button[data-eliminar-id]')?.dataset.eliminarId;
    if (!id || salir.disabled) return;
    const producto = listaProductos.find((actual) => actual.id === id);
    if (!producto || !window.confirm(`¿Eliminar «${producto.nombre}» (SKU ${producto.sku})? Esta acción es permanente.`)) return;

    camposProducto.disabled = true;
    agregar.disabled = true;
    salir.disabled = true;
    mensaje.textContent = 'Eliminando producto…';
    try {
      const { data: { session }, error } = await cliente.auth.getSession();
      if (error || !session) {
        mensaje.textContent = 'Tu sesión ya no está disponible. Vuelve a iniciar sesión.';
        return;
      }
      const respuesta = await fetch(`/api/productos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!respuesta.ok) {
        mensaje.textContent = (await respuesta.json()).error;
        return;
      }
      if (respuesta.status !== 204) throw new Error('Eliminación sin confirmar');
      if (productoEnEdicion?.id === id) cerrarFormulario();
      mostrarProductos(listaProductos.filter((actual) => actual.id !== id));
      mensaje.textContent = 'Producto eliminado.';
      buscador.focus();
    } catch {
      mensaje.textContent = 'No se pudo confirmar la eliminación. Consulta el listado antes de volver a intentarlo.';
    } finally {
      camposProducto.disabled = false;
      agregar.disabled = false;
      salir.disabled = false;
    }
  });

  agregar.addEventListener('click', () => abrirFormulario());
  cancelarProducto.addEventListener('click', () => {
    cerrarFormulario();
    agregar.focus();
  });

  formulario.addEventListener('input', (evento) => {
    const campo = evento.target.name;
    if (!campos.includes(campo) || document.getElementById(`error-${campo}`).hidden) return;

    const { errores } = leerFormulario();
    mostrarErrorCampo(campo, errores[campo]);
    if (mensaje.textContent === 'Revisa los campos indicados.' &&
        campos.every((nombre) => document.getElementById(`error-${nombre}`).hidden)) {
      mensaje.textContent = '';
    }
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (camposProducto.disabled || salir.disabled) return;
    const { datos, errores } = leerFormulario();
    mostrarErrores(errores);
    if (Object.keys(errores).length) {
      mensaje.textContent = 'Revisa los campos indicados.';
      return;
    }

    const id = productoEnEdicion?.id;
    camposProducto.disabled = true;
    agregar.disabled = true;
    salir.disabled = true;
    mensaje.textContent = 'Guardando producto…';
    let camposRechazados;
    try {
      const { data: { session }, error } = await cliente.auth.getSession();
      if (error || !session) {
        mensaje.textContent = 'Tu sesión ya no está disponible. Vuelve a iniciar sesión.';
        return;
      }
      const ruta = id ? `/api/productos/${encodeURIComponent(id)}` : '/api/productos';
      const respuesta = await fetch(ruta, {
        method: id ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        mensaje.textContent = resultado.error;
        camposRechazados = resultado.campos;
        return;
      }

      const producto = resultado.producto;
      mostrarProductos(id
        ? listaProductos.map((actual) => actual.id === id ? producto : actual)
        : [producto, ...listaProductos]);
      cerrarFormulario();
      mensaje.textContent = id ? 'Producto actualizado.' : 'Producto registrado.';
    } catch {
      mensaje.textContent = 'No se pudo confirmar el guardado. Consulta el listado antes de volver a intentarlo.';
    } finally {
      camposProducto.disabled = false;
      agregar.disabled = false;
      salir.disabled = false;
      if (camposRechazados) mostrarErrores(camposRechazados);
      if (formulario.hidden) agregar.focus();
    }
  });

  inicio.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    entrar.disabled = true;
    mensaje.textContent = 'Iniciando sesión…';
    try {
      const solicitud = cliente.auth.signInWithPassword({
        email: correo.value.trim(),
        password: contrasena.value,
      });
      contrasena.value = '';
      const { data, error } = await solicitud;
      if (error || !data.session) {
        mensaje.textContent = 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.';
        return;
      }

      const consulta = await fetch('/api/productos', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (!consulta.ok) throw new Error('Consulta no disponible');
      const datos = await consulta.json();
      mostrarProductos(datos.productos);
      inicio.hidden = true;
      inventario.hidden = false;
      mensaje.textContent = '';
      salir.focus();
    } catch {
      await cliente.auth.signOut({ scope: 'local' }).catch(() => {});
      mensaje.textContent = 'No se pudo abrir el inventario. Intenta de nuevo.';
    } finally {
      entrar.disabled = false;
    }
  });

  salir.addEventListener('click', async () => {
    salir.disabled = true;
    try {
      const { error } = await cliente.auth.signOut({ scope: 'local' });
      if (error) throw error;
      buscador.value = '';
      mostrarProductos([]);
      cerrarFormulario();
      inventario.hidden = true;
      inicio.reset();
      inicio.hidden = false;
      mensaje.textContent = 'Sesión cerrada.';
      correo.focus();
    } catch {
      mensaje.textContent = 'No se pudo cerrar la sesión. Intenta de nuevo.';
    } finally {
      salir.disabled = false;
    }
  });

  entrar.disabled = false;
}

iniciar().catch(() => {
  mensaje.textContent = 'No se pudo cargar la configuración de Supabase. Revisa el archivo .env y recarga la página.';
});
