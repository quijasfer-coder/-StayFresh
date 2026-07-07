-- ════════════════════════════════════════════════════════════════════
--  Stay Fresh — Seed data
--  Migración 0004
--
--  Datos de arranque para poder probar el flujo completo en local/staging.
--  Los valores marcados como PLACEHOLDER deben reemplazarse con datos
--  reales del negocio antes de ir a producción — ver README.
-- ════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
--  SERVICES — catálogo base por categoría
-- ─────────────────────────────────────────────────────────────────────

insert into public.services (name, category, description, display_order) values
  ('Lavado sneakers', 'tenis', 'Limpieza profunda de tenis/sneakers, tratamiento según material.', 1),
  ('Lavado botas', 'botas', 'Limpieza y cuidado de botas y calzado alto.', 2),
  ('Lavado gorras', 'gorras', 'Limpieza de gorras manteniendo la forma de la visera.', 3),
  ('Lavado bolsas', 'bolsas', 'Limpieza de bolsas según tipo de material.', 4);

-- ─────────────────────────────────────────────────────────────────────
--  COVERAGE_ZONES — PLACEHOLDER: reemplazar con la lista real de
--  colonias/CP donde Stay Fresh recolecta. Estas son solo para poder
--  probar el flujo de agendamiento en desarrollo.
-- ─────────────────────────────────────────────────────────────────────

insert into public.coverage_zones (colonia, alcaldia, notes) values
  ('Roma Norte', 'Cuauhtémoc', 'PLACEHOLDER — confirmar zona real con el negocio'),
  ('Condesa', 'Cuauhtémoc', 'PLACEHOLDER — confirmar zona real con el negocio'),
  ('Polanco', 'Miguel Hidalgo', 'PLACEHOLDER — confirmar zona real con el negocio'),
  ('Del Valle', 'Benito Juárez', 'PLACEHOLDER — confirmar zona real con el negocio'),
  ('Narvarte', 'Benito Juárez', 'PLACEHOLDER — confirmar zona real con el negocio');
