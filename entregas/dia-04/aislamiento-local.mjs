import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const config = parseEnv(readFileSync(new URL('../../.env', import.meta.url), 'utf8'));
const target = new URL(config.SUPABASE_URL);
const key = config.SUPABASE_PUBLISHABLE_KEY;
if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(target.origin) ||
    target.href !== target.origin + '/' || !/^sb_publishable_[\w-]+$/.test(key)) {
  throw new Error('Configuración pública de Supabase inválida.');
}

const address = '127.0.0.1:43174';
const cleanup = process.argv.includes('--post-migration-cleanup');
const html = `<!doctype html>
<html lang="es"><meta charset="utf-8"><title>Mini Inventario · Aislamiento RLS</title>
<h1>Prueba directa de aislamiento</h1>
<p>Introduce únicamente las credenciales de las cuentas de prueba confirmadas.</p>
<form autocomplete="off">
  <fieldset><legend>Cuenta A</legend>
    <label>Correo <input name="emailA" type="email" autocomplete="off" required></label>
    <label>Contraseña <input name="passwordA" type="password" autocomplete="off" required></label>
  </fieldset>
  <fieldset><legend>Cuenta B</legend>
    <label>Correo <input name="emailB" type="email" autocomplete="off" required></label>
    <label>Contraseña <input name="passwordB" type="password" autocomplete="off" required></label>
  </fieldset>
  <button type="submit">${cleanup ? 'Verificar aislamiento y limpiar los dos productos de prueba' : 'Iniciar sesiones y ejecutar prueba'}</button>
</form>
<pre role="status" aria-live="polite"></pre>
<script src="/run.js"></script></html>`;

function browser() {
  const form = document.querySelector('form');
  const output = document.querySelector('pre');
  const suffixes = ['A', 'B'];
  const sku = (alias) => 'PRUEBA-D04-RLS-' + alias;

  async function request(path, token, options = {}) {
    const headers = { apikey: settings.key, ...options.headers };
    if (token) headers.Authorization = 'Bearer ' + token;
    return fetch(settings.origin + path, { ...options, headers, redirect: 'error', cache: 'no-store' });
  }

  function requireSuccess(response, phase) {
    if (!response.ok) throw new Error(phase + ' (HTTP ' + response.status + ')');
  }

  async function login(alias, email, password) {
    const response = await request('/auth/v1/token?grant_type=password', null, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    requireSuccess(response, 'Inicio de sesión ' + alias);
    const { access_token: token } = await response.json();
    if (!token) throw new Error('Sesión ausente para ' + alias);
    const identity = await request('/auth/v1/user', token);
    requireSuccess(identity, 'Verificación de identidad ' + alias);
    const user = await identity.json();
    if (!user.id || user.is_anonymous || user.email?.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Identidad de prueba no confirmada para ' + alias);
    }
    return { token, id: user.id };
  }

  async function count(token, alias) {
    const response = await request('/rest/v1/productos?select=id&sku=ilike.' + sku(alias), token, {
      method: 'HEAD', headers: { Prefer: 'count=exact' },
    });
    requireSuccess(response, 'Consulta del SKU ' + alias);
    const total = response.headers.get('content-range')?.match(/\/(\d+)$/);
    if (!total) throw new Error('PostgREST no devolvió un conteo exacto');
    return Number(total[1]);
  }

  function productName(alias) {
    return 'PRUEBA RLS DÍA 4 — Producto ' + alias + ' (ficticio)';
  }

  async function confirmFixture(session, alias) {
    const response = await request(
      '/rest/v1/productos?select=id,user_id,sku,nombre,cantidad,minimo&sku=eq.' + sku(alias),
      session.token,
    );
    requireSuccess(response, 'Identificación del producto ' + alias);
    const rows = await response.json();
    const row = rows[0];
    if (rows.length !== 1 || row.user_id !== session.id || row.sku !== sku(alias) ||
        row.nombre !== productName(alias) || row.cantidad !== 1 || row.minimo !== 0 ||
        !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(row.id)) {
      throw new Error('Producto sintético inesperado para ' + alias);
    }
    return row.id;
  }

  async function deleteFixture(session, alias, id) {
    const filters = new URLSearchParams({
      id: 'eq.' + id, user_id: 'eq.' + session.id, sku: 'eq.' + sku(alias),
      nombre: 'eq.' + productName(alias), cantidad: 'eq.1', minimo: 'eq.0', select: 'id',
    });
    const response = await request('/rest/v1/productos?' + filters, session.token, {
      method: 'DELETE', headers: { Prefer: 'return=representation' },
    });
    requireSuccess(response, 'Eliminación del producto ' + alias);
    const rows = await response.json();
    if (rows.length !== 1 || rows[0].id !== id) {
      throw new Error('Eliminación no confirmada para ' + alias);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    form.reset();
    form.querySelector('button').disabled = true;
    const lines = [];
    const record = (line) => {
      lines.push(line);
      output.textContent = lines.join('\n');
    };
    let phase = 'Inicio de sesión';
    try {
      const sessions = [];
      for (const alias of suffixes) {
        sessions.push(await login(alias, fields.get('email' + alias).trim(), fields.get('password' + alias)));
        fields.delete('email' + alias);
        fields.delete('password' + alias);
      }
      if (sessions[0].id === sessions[1].id) throw new Error('Las dos sesiones tienen la misma identidad');
      record('Dos sesiones distintas verificadas.');
      if (!settings.cleanup) {
        phase = 'Comprobación previa de SKU';
        for (const session of sessions) {
          for (const alias of suffixes) {
            if (await count(session.token, alias) !== 0) throw new Error('SKU sintético ya visible: ' + alias);
          }
        }
        record('Ambos SKU ausentes desde las dos sesiones.');
        for (const [index, session] of sessions.entries()) {
          const alias = suffixes[index];
          phase = 'Alta del producto ' + alias;
          const response = await request('/rest/v1/productos', session.token, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body: JSON.stringify({ nombre: productName(alias), sku: sku(alias),
              cantidad: 1, minimo: 0, user_id: session.id }),
          });
          requireSuccess(response, phase);
          record('Producto ' + alias + ' creado.');
        }
      }
      phase = 'Matriz directa de aislamiento';
      for (const [index, session] of sessions.entries()) {
        for (const [column, alias] of suffixes.entries()) {
          const total = await count(session.token, alias);
          record('Cuenta ' + suffixes[index] + ' / producto ' + alias + ': ' + total);
          if (total !== Number(index === column)) throw new Error('Conteo contrario a la política esperada');
        }
      }
      if (settings.cleanup) {
        record('Matriz posterior a la migración aprobada.');
        phase = 'Identificación de ambos productos sintéticos';
        const ids = [];
        for (const [index, session] of sessions.entries()) {
          ids.push(await confirmFixture(session, suffixes[index]));
        }
        if (ids[0] === ids[1]) throw new Error('Se esperaba un identificador distinto por producto');
        for (const [index, session] of sessions.entries()) {
          const alias = suffixes[index];
          phase = 'Eliminación del producto ' + alias;
          await deleteFixture(session, alias, ids[index]);
          record('Producto ' + alias + ' eliminado.');
        }
        phase = 'Comprobación posterior a la eliminación';
        for (const [index, session] of sessions.entries()) {
          const alias = suffixes[index];
          if (await count(session.token, alias) !== 0) throw new Error('El SKU sigue visible para ' + alias);
          record('SKU ' + alias + ' después de la limpieza: 0');
        }
      }
      record('APROBADA');
    } catch {
      record('DETENIDA · ' + phase);
    } finally {
      for (const field of [...fields.keys()]) fields.delete(field);
      // The local server receives only aliases, statuses and counts.
      await fetch('/result', { method: 'POST', body: lines.join('\n') });
    }
  });
}

const script = 'const settings = ' + JSON.stringify({ origin: target.origin, key, cleanup }) + ';(' + browser.toString() + ')();';
let result = '';
createServer(async (req, res) => {
  const headers = {
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; connect-src 'self' " + target.origin + "; frame-ancestors 'none'; form-action 'none'; base-uri 'none'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };
  if (req.headers.host !== address) {
    res.writeHead(403, headers).end();
    return;
  }
  if (req.method === 'POST' && req.url === '/result' && req.headers.origin === 'http://' + address) {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 4096) return res.writeHead(413, headers).end();
    }
    if (!body.split('\n').every((line) => /^(Dos sesiones distintas verificadas\.|Ambos SKU ausentes desde las dos sesiones\.|Producto [AB] (creado|eliminado)\.|Cuenta [AB] \/ producto [AB]: \d+|Matriz posterior a la migración aprobada\.|SKU [AB] después de la limpieza: 0|APROBADA|DETENIDA · [\p{L}\d .:()/-]+)$/u.test(line))) {
      return res.writeHead(400, headers).end();
    }
    result = body;
    res.writeHead(204, headers).end();
    return;
  }
  const routes = { '/': ['text/html', html], '/run.js': ['text/javascript', script], '/result': ['text/plain', result] };
  const route = req.method === 'GET' && Object.hasOwn(routes, req.url) && routes[req.url];
  if (!route) return res.writeHead(404, headers).end();
  res.writeHead(200, { ...headers, 'Content-Type': route[0] + '; charset=utf-8' }).end(route[1]);
}).listen(43174, '127.0.0.1', () => console.log('Prueba local disponible en http://' + address + '/'));
