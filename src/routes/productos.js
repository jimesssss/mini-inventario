const { Router } = require('express');
const { clienteDelUsuario } = require('../db/supabase');

const columnas = 'id,nombre,sku,cantidad,minimo,created_at';
const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;

function validarProducto(body) {
  const producto = {};
  const campos = {};
  for (const campo of ['nombre', 'sku']) {
    const valor = body?.[campo];
    if (typeof valor !== 'string' || !valor.trim() || valor.includes('\0')) {
      campos[campo] = campo === 'sku' ? 'Escribe un SKU válido.' : 'Escribe un nombre válido.';
    } else {
      producto[campo] = valor.trim();
    }
  }
  for (const campo of ['cantidad', 'minimo']) {
    const valor = body?.[campo];
    if (!Number.isInteger(valor) || valor < 0 || valor > 2147483647) {
      campos[campo] = 'Escribe un entero entre 0 y 2147483647.';
    } else {
      producto[campo] = valor;
    }
  }
  return { producto, campos };
}

function rutasProductos(configuracion) {
  const router = Router();

  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const token = /^Bearer +([^\s,]+)$/i.exec(req.get('Authorization') ?? '')?.[1];
    if (!token) {
      return res.status(401).json({ error: 'Inicia sesión para acceder a tus productos.' });
    }
    if (!configuracion) {
      return res.status(503).json({ error: 'Falta configurar la conexión con Supabase.' });
    }

    const cliente = clienteDelUsuario(configuracion, token);
    const { data: { user }, error: errorSesion } = await cliente.auth.getUser(token);
    if (errorSesion?.name === 'AuthRetryableFetchError' || errorSesion?.status >= 500) {
      return res.status(502).json({ error: 'No se pudo verificar la sesión. Intenta de nuevo.' });
    }
    if (errorSesion || !user || user.is_anonymous) {
      return res.status(401).json({ error: 'Inicia sesión con una cuenta válida.' });
    }

    res.locals.cliente = cliente;
    res.locals.usuarioId = user.id;
    return next();
  });

  router.get('/', async (_req, res) => {
    const { cliente, usuarioId } = res.locals;
    const productos = [];
    const porPagina = 500;
    for (;;) {
      const { data, error } = await cliente.from('productos')
        .select(columnas)
        .eq('user_id', usuarioId)
        .order('created_at', { ascending: false })
        .order('id')
        .range(productos.length, productos.length + porPagina - 1);

      if (error) {
        return res.status(502).json({ error: 'No se pudieron consultar los productos.' });
      }
      if (!data.length) return res.json({ productos });
      productos.push(...data);
    }
  });

  async function guardarProducto(req, res) {
    const { cliente, usuarioId } = res.locals;
    const { id } = req.params;
    const noDisponible = 'El producto no está disponible para editar.';
    if (id !== undefined && !uuid.test(id)) {
      return res.status(404).json({ error: noDisponible });
    }

    const { producto, campos } = validarProducto(req.body);
    if (Object.keys(campos).length) {
      return res.status(400).json({ error: 'Revisa los campos indicados.', campos });
    }

    const tabla = cliente.from('productos');
    const operacion = id === undefined
      ? tabla.insert({ ...producto, user_id: usuarioId })
      : tabla.update(producto).eq('id', id).eq('user_id', usuarioId);
    const { data, error, status } = await operacion.select(columnas).maybeSingle();

    if (error?.code === '23505') {
      const mensaje = 'Ya tienes un producto con ese SKU.';
      return res.status(409).json({ error: mensaje, campos: { sku: mensaje } });
    }
    if (error) {
      const codigo = /^(?:[A-Z0-9]{5}|PGRST\d{3})$/.test(error.code) ? error.code : 'NO_DISPONIBLE';
      console.warn('Supabase: error de escritura de productos', {
        operacion: id === undefined ? 'INSERT' : 'UPDATE',
        codigo,
        estado: Number.isInteger(status) ? status : null,
      });
      if (codigo === '42501') {
        return res.status(403).json({ error: 'Supabase rechazó el guardado por permisos de escritura.' });
      }
      return res.status(502).json({ error: 'No se pudo confirmar el guardado. Consulta el listado antes de volver a intentarlo.' });
    }
    if (!data && id !== undefined) {
      return res.status(404).json({ error: noDisponible });
    }
    if (!data) {
      return res.status(502).json({ error: 'No se pudo confirmar el registro. Consulta el listado antes de volver a intentarlo.' });
    }

    return res.status(id === undefined ? 201 : 200).json({ producto: data });
  }

  router.post('/', guardarProducto);
  router.patch('/:id', guardarProducto);

  router.delete('/:id', async (req, res) => {
    const { cliente, usuarioId } = res.locals;
    const { id } = req.params;
    if (!uuid.test(id)) {
      return res.status(400).json({ error: 'El identificador del producto no es válido.' });
    }

    const { data, error } = await cliente.from('productos')
      .delete()
      .eq('id', id)
      .eq('user_id', usuarioId)
      .select('id')
      .maybeSingle();

    if (error?.code === '42501') {
      return res.status(403).json({ error: 'Supabase rechazó la eliminación por permisos.' });
    }
    if (error) {
      return res.status(502).json({ error: 'No se pudo confirmar la eliminación. Consulta el listado antes de volver a intentarlo.' });
    }
    if (!data) {
      return res.status(404).json({ error: 'El producto no está disponible para eliminar.' });
    }
    return res.status(204).end();
  });

  return router;
}

module.exports = rutasProductos;
