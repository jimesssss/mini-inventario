const express = require('express');
const path = require('node:path');
const { leerConfiguracion } = require('./db/supabase');
const rutasProductos = require('./routes/productos');

const app = express();
const puerto = Number(process.env.PORT || 3000);
const configuracion = leerConfiguracion();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/js/supabase.js', (_req, res) => {
  const paquete = path.dirname(require.resolve('@supabase/supabase-js'));
  res.sendFile(path.join(paquete, 'umd', 'supabase.js'));
});

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok' });
});

app.get('/api/configuracion', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!configuracion) {
    return res.status(503).json({ error: 'Revisa SUPABASE_URL (URL base sin /rest/v1) y SUPABASE_PUBLISHABLE_KEY en .env.' });
  }
  return res.json(configuracion);
});

app.use('/api/productos', rutasProductos(configuracion));

app.use((_error, _req, res, _next) => {
  res.status(500).json({ error: 'No se pudo completar la solicitud.' });
});

const servidor = app.listen(puerto, '0.0.0.0', () => {
  console.log(`Mini Inventario está disponible en http://localhost:${servidor.address().port}`);
});
