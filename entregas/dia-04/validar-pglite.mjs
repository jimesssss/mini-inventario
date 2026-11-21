import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { PGlite } = await import(pathToFileURL(resolve(process.argv[2])).href);
const db = new PGlite();
const migrations = new URL('../../supabase/migrations/', import.meta.url);
const readMigration = (name) => readFile(new URL(name, migrations), 'utf8');
const rows = async (sql) => (await db.query(sql)).rows;
const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
const expectedDenial = (sql) => assert.rejects(db.query(sql), { code: '42501' });

async function identity(role, id = '', anonymous = false) {
  await db.exec(`reset role; set test.uid = '${id}'; set test.anonymous = '${anonymous}'; set role ${role};`);
}

const privileges = () => rows(`
  select role,
    has_table_privilege(role, 'public.productos', 'SELECT') as read,
    has_table_privilege(role, 'public.productos', 'DELETE') as remove,
    has_table_privilege(role, 'public.productos', 'INSERT') as table_insert,
    has_table_privilege(role, 'public.productos', 'UPDATE') as table_update,
    array(select attname from pg_attribute where attrelid='public.productos'::regclass
      and attnum>0 and not attisdropped and has_column_privilege(role,attrelid,attnum,'INSERT') order by attnum) as insert_cols,
    array(select attname from pg_attribute where attrelid='public.productos'::regclass
      and attnum>0 and not attisdropped and has_column_privilege(role,attrelid,attnum,'UPDATE') order by attnum) as update_cols
  from (values ('anon'),('authenticated'),('public')) as roles(role) order by role
`);
const inventory = () => rows('select * from public.productos order by id');
const policies = () => rows("select * from pg_policies where schemaname='public' and tablename='productos' order by policyname");

try {
  console.log((await rows('select version()'))[0].version);
  await db.exec(`
    create role anon;
    create role authenticated;
    create schema auth;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('${alice}'), ('${bob}');
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('test.uid', true),'')::uuid $$;
    create function auth.jwt() returns jsonb language sql stable
      as $$ select jsonb_build_object('is_anonymous', current_setting('test.anonymous',true)::boolean) $$;
    grant usage on schema auth to authenticated;
  `);
  await db.exec(await readMigration('20261119000000_crear_productos.sql'));
  await db.exec(`
    grant select, insert, update, delete on public.productos to anon, authenticated;
    insert into public.productos (user_id,nombre,sku,cantidad,minimo) values
      ('${alice}','Producto A','A',5,2), ('${bob}','Producto B','B',4,1);
  `);
  const originalRows = await inventory();
  const originalPolicies = await policies();
  assert.equal(originalPolicies.length, 5);
  const before = await privileges();
  console.log('Privilegios antes:', JSON.stringify(before));
  for (const entry of before.slice(0, 2)) {
    assert.ok(entry.read && entry.remove && entry.table_insert && entry.table_update);
  }
  const migration = await readMigration('20261120000000_ajustar_privilegios_productos.sql');
  await db.exec(migration);
  const after = await privileges();
  console.log('Privilegios después:', JSON.stringify(after));
  for (const entry of [after[0], after[2]]) {
    assert.deepEqual(entry, { role: entry.role, read: false, remove: false,
      table_insert: false, table_update: false, insert_cols: [], update_cols: [] });
  }
  assert.deepEqual(after[1], { role: 'authenticated', read: true, remove: true,
    table_insert: false, table_update: false,
    insert_cols: ['user_id','nombre','sku','cantidad','minimo'],
    update_cols: ['nombre','sku','cantidad','minimo'] });
  assert.deepEqual(await inventory(), originalRows);
  assert.deepEqual(await policies(), originalPolicies);
  await db.exec(migration);
  assert.deepEqual(await privileges(), after);
  assert.deepEqual(await inventory(), originalRows);
  assert.deepEqual(await policies(), originalPolicies);
  assert.deepEqual(await rows("select relrowsecurity from pg_class where oid='public.productos'::regclass"), [{ relrowsecurity: true }]);
  console.log('PASS: dos aplicaciones, privilegios esperados, RLS activa, cinco políticas y filas originales intactas');

  await identity('anon');
  for (const sql of ['select * from public.productos',
    "insert into public.productos(nombre,sku,cantidad,minimo) values ('X','X',1,0)",
    'update public.productos set cantidad=1', 'delete from public.productos']) {
    await expectedDenial(sql);
  }
  console.log('PASS: anon sin SELECT, INSERT, UPDATE ni DELETE');

  await identity('authenticated', alice);
  assert.deepEqual((await inventory()).map(({ sku }) => sku), ['A']);
  const [created] = await rows(`insert into public.productos(user_id,nombre,sku,cantidad,minimo)
    values ('${alice}','Prueba','TEMP',2,1) returning id,created_at,user_id`);
  assert.match(created.id, /^[\da-f-]{36}$/i);
  assert.ok(Number.isFinite(new Date(created.created_at).getTime()));
  assert.equal(created.user_id, alice);
  assert.equal((await rows(`update public.productos set cantidad=3 where id='${created.id}' returning cantidad`))[0].cantidad, 3);
  await expectedDenial(`insert into public.productos(user_id,nombre,sku,cantidad,minimo) values ('${bob}','Ajeno','X',1,0)`);
  await expectedDenial("insert into public.productos(id,nombre,sku,cantidad,minimo) values (gen_random_uuid(),'X','X',1,0)");
  await expectedDenial("insert into public.productos(created_at,nombre,sku,cantidad,minimo) values (now(),'X','X',1,0)");
  for (const expression of ['id=id','created_at=created_at','user_id=user_id']) {
    await expectedDenial(`update public.productos set ${expression} where id='${created.id}'`);
  }
  await db.exec('reset role; begin; grant update (user_id) on public.productos to authenticated; savepoint check_policy;');
  await identity('authenticated', alice);
  await assert.rejects(
    db.query(`update public.productos set user_id='${bob}' where id='${created.id}'`),
    { code: '42501', message: /row-level security policy/i },
  );
  await db.exec('rollback to savepoint check_policy; rollback;');
  assert.deepEqual(await privileges(), after);
  console.log('PASS: WITH CHECK de UPDATE impide transferir una fila incluso con permiso temporal sobre user_id');
  await identity('authenticated', bob);
  assert.deepEqual((await inventory()).map(({ sku }) => sku), ['B']);
  assert.deepEqual(await rows(`select id from public.productos where id='${created.id}'`), []);
  assert.deepEqual(await rows(`update public.productos set cantidad=0 where id='${created.id}' returning id`), []);
  assert.deepEqual(await rows(`delete from public.productos where id='${created.id}' returning id`), []);
  console.log('PASS: alta y edición propias, valores automáticos, columnas protegidas y aislamiento entre dos identidades');

  await identity('authenticated', alice, true);
  assert.deepEqual(await inventory(), []);
  await expectedDenial(`insert into public.productos(user_id,nombre,sku,cantidad,minimo) values ('${alice}','Anónimo','X',1,0)`);
  assert.deepEqual(await rows(`update public.productos set cantidad=0 where id='${created.id}' returning id`), []);
  assert.deepEqual(await rows(`delete from public.productos where id='${created.id}' returning id`), []);
  await identity('authenticated', alice);
  assert.deepEqual(await rows(`delete from public.productos where id='${created.id}' returning id`), [{ id: created.id }]);
  await db.exec('reset role');
  assert.deepEqual(await inventory(), originalRows);
  console.log('PASS: bloqueo de sesión anónima, borrado propio y preservación de filas originales');
} finally {
  await db.close();
}
