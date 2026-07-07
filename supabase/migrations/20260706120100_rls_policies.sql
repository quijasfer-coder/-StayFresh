-- ════════════════════════════════════════════════════════════════════
--  Stay Fresh — RLS policies + Auth trigger
--  Migración 0002
--
--  Resumen de modelo de acceso:
--   · coverage_zones / services: lectura pública (solo active/is_active),
--     escritura solo staff/admin — el sitio de agendamiento anónimo
--     necesita leer estas para el checkeo de cobertura y el catálogo.
--   · clients / pickups / pickup_items / pickup_status_history: NO
--     legibles anónimamente. El booking público inserta vía la función
--     SECURITY DEFINER `create_public_booking` (migración 0003), no vía
--     policies de INSERT directas — así se centraliza la validación de
--     cobertura del lado del servidor.
--   · profiles: solo el dueño + admin.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
--  HELPER FUNCTIONS — security definer para evitar recursión con RLS
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- ─────────────────────────────────────────────────────────────────────
--  ENABLE RLS — explícito en todas las tablas (idempotente)
-- ─────────────────────────────────────────────────────────────────────

alter table public.profiles              enable row level security;
alter table public.coverage_zones        enable row level security;
alter table public.services               enable row level security;
alter table public.clients                enable row level security;
alter table public.pickups                enable row level security;
alter table public.pickup_items           enable row level security;
alter table public.pickup_status_history  enable row level security;

-- ═════════════════════════════════════════════════════════════════════
--  PROFILES
-- ═════════════════════════════════════════════════════════════════════

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- INSERT: vía trigger handle_new_user() que es SECURITY DEFINER.
-- DELETE: cascade desde auth.users.

-- ═════════════════════════════════════════════════════════════════════
--  COVERAGE_ZONES — lectura pública de zonas activas, escritura staff
-- ═════════════════════════════════════════════════════════════════════

create policy "coverage_zones_public_read"
  on public.coverage_zones for select
  to anon, authenticated
  using (active = true or public.is_staff());

create policy "coverage_zones_staff_all"
  on public.coverage_zones for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ═════════════════════════════════════════════════════════════════════
--  SERVICES — catálogo de lectura pública, escritura staff
-- ═════════════════════════════════════════════════════════════════════

create policy "services_public_read"
  on public.services for select
  to anon, authenticated
  using (is_active = true or public.is_staff());

create policy "services_staff_all"
  on public.services for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ═════════════════════════════════════════════════════════════════════
--  CLIENTS / PICKUPS / PICKUP_ITEMS / PICKUP_STATUS_HISTORY
--  Solo staff — sin policies de INSERT/UPDATE públicas. El booking
--  anónimo entra por `create_public_booking` (SECURITY DEFINER).
-- ═════════════════════════════════════════════════════════════════════

create policy "clients_staff_all"
  on public.clients for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "pickups_staff_all"
  on public.pickups for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "pickup_items_staff_all"
  on public.pickup_items for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "pickup_status_history_staff_read"
  on public.pickup_status_history for select
  to authenticated
  using (public.is_staff());

-- ═════════════════════════════════════════════════════════════════════
--  AUTH TRIGGER — auto-crear profile al invitar/registrar una cuenta
--  de staff. Las cuentas de Stay Fresh se crean manualmente (Supabase
--  dashboard → Authentication → Invite user, o `supabase.auth.admin.
--  inviteUserByEmail`), nunca por registro público. Toda cuenta nueva
--  entra con role='staff'; promover a 'admin' es un UPDATE manual
--  posterior (ver README).
-- ═════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'staff'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
