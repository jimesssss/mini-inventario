begin;

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id),
  nombre text not null constraint productos_nombre_no_vacio
    check (nombre ~ '[^[:space:]]'),
  sku text not null constraint productos_sku_no_vacio
    check (sku ~ '[^[:space:]]'),
  cantidad integer not null constraint productos_cantidad_no_negativa
    check (cantidad >= 0),
  minimo integer not null constraint productos_minimo_no_negativo
    check (minimo >= 0),
  created_at timestamptz not null default now()
);

create function public.productos_recortar_textos()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.nombre := regexp_replace(new.nombre, '^[[:space:]]+|[[:space:]]+$', '', 'g');
  new.sku := regexp_replace(new.sku, '^[[:space:]]+|[[:space:]]+$', '', 'g');
  return new;
end;
$$;

create trigger productos_recortar_textos
  before insert or update of nombre, sku on public.productos
  for each row execute function public.productos_recortar_textos();

revoke execute on function public.productos_recortar_textos()
  from public, anon, authenticated;

create unique index productos_user_id_sku_unico
  on public.productos (user_id, lower(sku));

alter table public.productos enable row level security;

revoke all privileges on table public.productos from public, anon, authenticated;
grant select, delete on table public.productos to authenticated;
grant insert (user_id, nombre, sku, cantidad, minimo)
  on table public.productos to authenticated;
grant update (nombre, sku, cantidad, minimo)
  on table public.productos to authenticated;

-- Supabase Auth también asigna el rol authenticated a las sesiones anónimas.
create policy productos_sesion_no_anonima
  on public.productos as restrictive for all to authenticated
  using ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true')
  with check ((select auth.jwt() ->> 'is_anonymous') is distinct from 'true');

create policy productos_consultar_propios
  on public.productos for select to authenticated
  using (user_id = (select auth.uid()));

create policy productos_registrar_propios
  on public.productos for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy productos_actualizar_propios
  on public.productos for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy productos_eliminar_propios
  on public.productos for delete to authenticated
  using (user_id = (select auth.uid()));

commit;
