begin;

revoke all privileges on table public.productos from public, anon;
revoke insert, update on table public.productos from authenticated;

grant select, delete on table public.productos to authenticated;
grant insert (user_id, nombre, sku, cantidad, minimo)
  on table public.productos to authenticated;
grant update (nombre, sku, cantidad, minimo)
  on table public.productos to authenticated;

commit;
