-- ════════════════════════════════════════════════════════════════════
--  Stay Fresh — Schema inicial
--  Migración 0001
--
--  Esta migración crea la estructura completa de tablas, índices y
--  triggers básicos. NO incluye RLS, funciones de negocio ni seed data
--  (esos van en migraciones 0002, 0003, 0004 respectivamente).
--
--  Modelo conceptual:
--   · profiles         = cuentas de staff/admin (1 por auth.user).
--                        Los CLIENTES de Stay Fresh no tienen cuenta —
--                        el agendamiento público es anónimo.
--   · coverage_zones   = colonias/CP donde se recolecta, editable sin deploy
--   · clients           = quien pide el servicio (identificado por phone)
--   · pickups           = una recolección (agendada → ... → entregado)
--   · pickup_items      = las piezas de una recolección (tenis/botas/...)
--   · pickup_status_history = auditoría + trigger de notificación WhatsApp
-- ════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────────────────────────────────

create type user_role as enum ('admin', 'staff');
create type item_category as enum ('tenis', 'botas', 'gorras', 'bolsas');
create type pickup_status as enum (
  'agendada', 'recolectado', 'en_proceso', 'listo', 'en_camino', 'entregado', 'cancelada'
);

-- ─────────────────────────────────────────────────────────────────────
--  PROFILES — cuentas de staff/admin, extiende auth.users de Supabase.
--  No hay cuentas públicas de cliente en el MVP.
-- ─────────────────────────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null,
  role        user_role not null default 'staff',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Cuenta de staff/admin de Stay Fresh. 1:1 con auth.users.';

-- ─────────────────────────────────────────────────────────────────────
--  COVERAGE_ZONES — lista de colonias/CP editable desde el panel admin.
--  NO es un mapa/polígono — match exacto de CP o de nombre de colonia.
-- ─────────────────────────────────────────────────────────────────────

create table public.coverage_zones (
  id          uuid primary key default gen_random_uuid(),
  colonia     text not null,
  cp          text,
  alcaldia    text,
  active      boolean not null default true,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index coverage_zones_colonia_cp_unique
  on public.coverage_zones (lower(colonia), coalesce(cp, ''));
create index coverage_zones_cp_idx on public.coverage_zones(cp) where active = true;
create index coverage_zones_colonia_idx on public.coverage_zones(lower(colonia)) where active = true;

-- ─────────────────────────────────────────────────────────────────────
--  SERVICES — catálogo simple. Precio opcional para el MVP (puede
--  cotizarse manualmente al principio).
-- ─────────────────────────────────────────────────────────────────────

create table public.services (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  category          item_category not null,
  base_price_cents  int,
  description       text,
  is_active         boolean not null default true,
  display_order     int not null default 0,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
--  CLIENTS — quien pide el servicio. `phone` es único y es también el
--  identificador de WhatsApp (bot entrante/saliente).
-- ─────────────────────────────────────────────────────────────────────

create table public.clients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text not null,
  address     text,
  colonia     text,
  cp          text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index clients_phone_unique on public.clients (phone);
create index clients_colonia_idx on public.clients(lower(colonia));

-- ─────────────────────────────────────────────────────────────────────
--  PICKUPS (recolecciones) — colonia/cp/address son un snapshot al
--  momento del booking (el cliente puede mudarse después sin afectar
--  el histórico). total_items se mantiene sincronizado por trigger.
-- ─────────────────────────────────────────────────────────────────────

create table public.pickups (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references public.clients(id) on delete restrict,
  status            pickup_status not null default 'agendada',
  requested_at      timestamptz not null default now(),
  scheduled_date    date not null,
  scheduled_window  text,
  colonia           text not null,
  cp                text,
  address           text,
  total_items       int not null default 0,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index pickups_client_id_idx on public.pickups(client_id);
create index pickups_status_idx on public.pickups(status);
create index pickups_scheduled_date_idx on public.pickups(scheduled_date);

-- ─────────────────────────────────────────────────────────────────────
--  PICKUP_ITEMS — una recolección agrupa varias categorías
--  (ej. 2 tenis + 1 gorra en la misma recolección).
-- ─────────────────────────────────────────────────────────────────────

create table public.pickup_items (
  id           uuid primary key default gen_random_uuid(),
  pickup_id    uuid not null references public.pickups(id) on delete cascade,
  category     item_category not null,
  quantity     int not null check (quantity > 0),
  description  text,
  service_id   uuid references public.services(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index pickup_items_pickup_id_idx on public.pickup_items(pickup_id);

-- ─────────────────────────────────────────────────────────────────────
--  PICKUP_STATUS_HISTORY — auditoría de cambios de status. También
--  es lo que dispara (desde la capa de aplicación) el mensaje de
--  WhatsApp saliente al cliente.
-- ─────────────────────────────────────────────────────────────────────

create table public.pickup_status_history (
  id                 uuid primary key default gen_random_uuid(),
  pickup_id          uuid not null references public.pickups(id) on delete cascade,
  status             pickup_status not null,
  changed_by         uuid references public.profiles(id) on delete set null,
  changed_at         timestamptz not null default now(),
  notified_whatsapp  boolean not null default false
);

create index pickup_status_history_pickup_id_idx on public.pickup_status_history(pickup_id);

-- ─────────────────────────────────────────────────────────────────────
--  TRIGGERS — auto-actualizar updated_at
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at_coverage_zones
  before update on public.coverage_zones
  for each row execute function public.set_updated_at();

create trigger set_updated_at_clients
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger set_updated_at_pickups
  before update on public.pickups
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
--  TRIGGER — mantener pickups.total_items sincronizado con
--  sum(pickup_items.quantity)
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.recalc_pickup_total_items()
returns trigger
language plpgsql
as $$
begin
  update public.pickups
    set total_items = (
      select coalesce(sum(quantity), 0) from public.pickup_items
      where pickup_id = coalesce(new.pickup_id, old.pickup_id)
    )
    where id = coalesce(new.pickup_id, old.pickup_id);
  return coalesce(new, old);
end;
$$;

create trigger recalc_total_items_ins_upd_del
  after insert or update or delete on public.pickup_items
  for each row execute function public.recalc_pickup_total_items();

-- ─────────────────────────────────────────────────────────────────────
--  TRIGGERS — loguear cada cambio de status en pickup_status_history.
--  Separados en INSERT/UPDATE (en vez de un solo IF TG_OP = 'INSERT' OR
--  ...) para no depender de OLD estando asignado en el caso INSERT.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.log_pickup_status_insert()
returns trigger
language plpgsql
as $$
begin
  insert into public.pickup_status_history (pickup_id, status, changed_by)
  values (new.id, new.status, nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);
  return new;
end;
$$;

create trigger log_status_on_insert
  after insert on public.pickups
  for each row execute function public.log_pickup_status_insert();

create or replace function public.log_pickup_status_update()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.pickup_status_history (pickup_id, status, changed_by)
    values (new.id, new.status, nullif(current_setting('request.jwt.claim.sub', true), '')::uuid);
  end if;
  return new;
end;
$$;

create trigger log_status_on_update
  after update of status on public.pickups
  for each row execute function public.log_pickup_status_update();
