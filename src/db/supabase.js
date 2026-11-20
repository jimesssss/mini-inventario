const { createClient } = require('@supabase/supabase-js');

function leerConfiguracion() {
  const url = process.env.SUPABASE_URL?.trim();
  const clave = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const destino = URL.parse(url ?? '');

  if (destino?.protocol !== 'https:' || destino.username || destino.password ||
      destino.pathname !== '/' || destino.search || destino.hash ||
      destino.hostname === 'tu-proyecto.supabase.co' ||
      !clave?.startsWith('sb_publishable_') || clave === 'sb_publishable_REEMPLAZAR') {
    return null;
  }

  return { url, clave };
}

function clienteDelUsuario({ url, clave }, token) {
  return createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

module.exports = { leerConfiguracion, clienteDelUsuario };
