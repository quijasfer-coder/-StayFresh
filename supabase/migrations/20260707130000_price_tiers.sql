-- ════════════════════════════════════════════════════════════════════
--  Stay Fresh — Precios por paquete (price_tiers)
--  Migración 0005
--
--  Módulo de precios totalmente configurable desde /admin/precios:
--  por cada categoría (tenis/botas/gorras/bolsas) el staff define
--  "paquetes" — ej. 1 par $150, 3 pares $400, 5 pares $600 — y el
--  cliente los agrega como líneas independientes al agendar (3 pares +
--  1 gorra = 2 líneas, cada una con su propio precio). El precio de
--  cada línea se congela en pickup_items.price_cents al momento de
--  agendar, para no verse afectado si el staff cambia los precios
--  después.
-- ════════════════════════════════════════════════════════════════════

create table public.price_tiers (
  id            uuid primary key default gen_random_uuid(),
  category      item_category not null,
  quantity      int not null check (quantity > 0),
  price_cents   int not null check (price_cents >= 0),
  active        boolean not null default true,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (category, quantity)
);

create index price_tiers_category_idx on public.price_tiers(category) where active = true;

create trigger set_updated_at_price_tiers
  before update on public.price_tiers
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
--  RLS — mismo patrón que coverage_zones/services: lectura pública de
--  paquetes activos (el formulario de agendar es anónimo), escritura
--  solo staff.
-- ─────────────────────────────────────────────────────────────────────

alter table public.price_tiers enable row level security;

create policy "price_tiers_public_read"
  on public.price_tiers for select
  to anon, authenticated
  using (active = true or public.is_staff());

create policy "price_tiers_staff_all"
  on public.price_tiers for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ─────────────────────────────────────────────────────────────────────
--  PICKUP_ITEMS / PICKUPS — precio por línea + total del pickup
-- ─────────────────────────────────────────────────────────────────────

alter table public.pickup_items add column price_cents int;
alter table public.pickups add column total_price_cents int not null default 0;

create or replace function public.recalc_pickup_total_price()
returns trigger
language plpgsql
as $$
begin
  update public.pickups
    set total_price_cents = (
      select coalesce(sum(price_cents), 0) from public.pickup_items
      where pickup_id = coalesce(new.pickup_id, old.pickup_id)
    )
    where id = coalesce(new.pickup_id, old.pickup_id);
  return coalesce(new, old);
end;
$$;

create trigger recalc_total_price_ins_upd_del
  after insert or update or delete on public.pickup_items
  for each row execute function public.recalc_pickup_total_price();

-- ─────────────────────────────────────────────────────────────────────
--  CREATE_PUBLIC_BOOKING — misma firma, ahora también guarda el precio
--  por línea (viene precalculado desde el cliente a partir de
--  price_tiers; si un ítem no tiene paquete definido, price_cents llega
--  null y esa línea queda "a cotizar").
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
    insert into public.pickup_items (pickup_id, category, quantity, description, price_cents)
    values (
      v_pickup_id,
      (v_item->>'category')::item_category,
      (v_item->>'quantity')::int,
      v_item->>'description',
      (v_item->>'price_cents')::int
    );
  end loop;

  return v_pickup_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
--  SEED — placeholders de ejemplo, reemplazar/ampliar desde
--  /admin/precios (no bloquea nada si quedan tal cual o se desactivan).
-- ─────────────────────────────────────────────────────────────────────

insert into public.price_tiers (category, quantity, price_cents, display_order) values
  ('tenis', 1, 15000, 1),
  ('tenis', 3, 40000, 2),
  ('tenis', 5, 60000, 3);
