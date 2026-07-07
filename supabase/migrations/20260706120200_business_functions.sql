-- ════════════════════════════════════════════════════════════════════
--  Stay Fresh — Business Functions + vistas
--  Migración 0003
--
--  Llamables desde Next.js así:
--    await supabase.rpc('check_coverage', { p_colonia, p_cp });
--    await supabase.rpc('create_public_booking', { ... });
--    await supabase.rpc('update_pickup_status', { p_pickup_id, p_status });
--
--  Errores codificados (mensajes consistentes para el frontend):
--    ZONE_NOT_COVERED   la colonia/CP no está en coverage_zones activa
--    NOT_AUTHORIZED     quien llama update_pickup_status no es staff
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
--  CHECK_COVERAGE — valida colonia/CP contra coverage_zones activas.
--  Re-verificada del lado del servidor dentro de create_public_booking
--  para no confiar solo en el checkeo del lado del cliente.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.check_coverage(p_colonia text, p_cp text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.coverage_zones
    where active = true
      and (
        (p_cp is not null and cp = p_cp)
        or (p_colonia is not null and lower(colonia) = lower(trim(p_colonia)))
      )
  );
$$;

comment on function public.check_coverage is
  'true si la colonia o el CP dado hace match con alguna coverage_zone activa.';

-- ─────────────────────────────────────────────────────────────────────
--  CREATE_PUBLIC_BOOKING — inserta cliente + pickup + items de forma
--  atómica desde el formulario público anónimo. p_items es un jsonb
--  array: [{category, quantity, description}, ...]
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.create_public_booking(
  p_full_name text,
  p_phone text,
  p_address text,
  p_colonia text,
  p_cp text,
  p_scheduled_date date,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_pickup_id uuid;
  v_item jsonb;
begin
  if not public.check_coverage(p_colonia, p_cp) then
    raise exception 'ZONE_NOT_COVERED' using errcode = 'P0001';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'NO_ITEMS' using errcode = 'P0001';
  end if;

  insert into public.clients (full_name, phone, address, colonia, cp)
    values (p_full_name, p_phone, p_address, p_colonia, p_cp)
    on conflict (phone) do update
      set full_name = excluded.full_name,
          address = excluded.address,
          colonia = excluded.colonia,
          cp = excluded.cp,
          updated_at = now()
    returning id into v_client_id;

  insert into public.pickups (client_id, scheduled_date, colonia, cp, address)
    values (v_client_id, p_scheduled_date, p_colonia, p_cp, p_address)
    returning id into v_pickup_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.pickup_items (pickup_id, category, quantity, description)
    values (
      v_pickup_id,
      (v_item->>'category')::item_category,
      (v_item->>'quantity')::int,
      v_item->>'description'
    );
  end loop;

  return v_pickup_id;
end;
$$;

comment on function public.create_public_booking is
  'Alta atómica de cliente+pickup+items desde el formulario público. Re-valida cobertura server-side.';

-- ─────────────────────────────────────────────────────────────────────
--  UPDATE_PICKUP_STATUS — restringida a staff. El cambio de status
--  queda logueado automáticamente por el trigger log_status_on_update
--  (migración 0001); esta función solo valida permiso y aplica el update.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.update_pickup_status(p_pickup_id uuid, p_status pickup_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'NOT_AUTHORIZED' using errcode = 'P0001';
  end if;

  update public.pickups set status = p_status where id = p_pickup_id;

  if not found then
    raise exception 'PICKUP_NOT_FOUND' using errcode = 'P0001';
  end if;
end;
$$;

comment on function public.update_pickup_status is
  'Actualiza el status de un pickup. Solo staff/admin. Dispara el log de auditoría vía trigger.';

-- ─────────────────────────────────────────────────────────────────────
--  CLIENT_TOTALS — vista de conveniencia para el panel de clientes:
--  total de recolecciones y de piezas acumuladas por cliente.
--  Solo consultable por staff (mismo nivel de acceso que las tablas
--  base que agrega).
-- ─────────────────────────────────────────────────────────────────────

create view public.client_totals as
  select
    c.id,
    c.full_name,
    c.phone,
    c.colonia,
    c.cp,
    count(distinct p.id) as total_pickups,
    coalesce(sum(pi.quantity), 0) as total_items
  from public.clients c
  left join public.pickups p on p.client_id = c.id
  left join public.pickup_items pi on pi.pickup_id = p.id
  group by c.id;

-- ─────────────────────────────────────────────────────────────────────
--  PERMISOS — explícitos para evitar exposición accidental
-- ─────────────────────────────────────────────────────────────────────

revoke execute on function public.check_coverage(text, text)                       from public;
revoke execute on function public.create_public_booking(text, text, text, text, text, date, jsonb) from public;
revoke execute on function public.update_pickup_status(uuid, pickup_status)        from public;

grant execute on function public.check_coverage(text, text)                        to anon, authenticated;
grant execute on function public.create_public_booking(text, text, text, text, text, date, jsonb) to anon, authenticated;
grant execute on function public.update_pickup_status(uuid, pickup_status)         to authenticated;

grant select on public.client_totals to authenticated;
revoke select on public.client_totals from anon;
