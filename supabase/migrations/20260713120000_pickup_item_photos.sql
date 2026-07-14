-- ════════════════════════════════════════════════════════════════════
--  Stay Fresh — Foto por pieza en el booking público
--  Migración 0006
--
--  El cliente puede adjuntar una foto por pieza (ej. sus tenis) al
--  agendar. La foto se sube a Storage desde el navegador ANTES de
--  llamar a create_public_booking (la función es SQL puro, no puede
--  recibir archivos) — el booking público manda la URL ya resultante
--  dentro de cada item del jsonb, igual que ya hace con price_cents.
-- ════════════════════════════════════════════════════════════════════

alter table public.pickup_items add column photo_url text;

-- ─────────────────────────────────────────────────────────────────────
--  STORAGE BUCKET — público de solo-lectura (son fotos de tenis/botas,
--  no datos sensibles). INSERT abierto a anon/authenticated porque el
--  booking es anónimo, igual que create_public_booking.
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pickup-photos', 'pickup-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "pickup_photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'pickup-photos');

create policy "pickup_photos_anon_upload"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'pickup-photos');

-- ─────────────────────────────────────────────────────────────────────
--  CREATE_PUBLIC_BOOKING — misma firma, ahora también guarda photo_url
--  por línea (viene de la subida a Storage hecha en el cliente; null
--  si el cliente no adjuntó foto para esa pieza).
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
    insert into public.pickup_items (pickup_id, category, quantity, description, price_cents, photo_url)
    values (
      v_pickup_id,
      (v_item->>'category')::item_category,
      (v_item->>'quantity')::int,
      v_item->>'description',
      (v_item->>'price_cents')::int,
      v_item->>'photo_url'
    );
  end loop;

  return v_pickup_id;
end;
$$;
