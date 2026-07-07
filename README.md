# Stay Fresh — plataforma de agendamiento + operación

Plataforma para Stay Fresh (lavado profesional de sneakers, botas, gorras y
bolsas a domicilio en CDMX): sitio público de agendamiento con validación de
zona de cobertura, panel interno para el equipo, y una capa de bot de
WhatsApp Business para dar seguimiento de status a los clientes.

Proyecto personal e independiente — no tiene relación con TOG/CAAVI ni con
ningún otro proyecto del sandbox.

## Stack

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + Supabase
(Postgres, Auth, RLS). Sin Stripe (pago contra entrega) ni mapa/geolocalización
(la cobertura se valida contra una lista de colonias/CP editable desde el
panel admin).

## Setup local

1. `npm install`
2. Copia `.env.example` a `.env.local` y llena `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` con los de tu
   proyecto de Supabase (o usa `supabase start` para un stack local con la
   Supabase CLI).
3. Aplica las migraciones (`supabase/migrations/*.sql`) contra tu proyecto:
   `supabase db reset` (local) o `supabase migration up` (proyecto remoto
   enlazado con `supabase link`).
4. `npm run dev` y abre `http://localhost:3000`.

Los tipos en `lib/database.types.ts` están escritos a mano siguiendo el
esquema de las migraciones. Una vez que exista un proyecto real de Supabase,
regenéralos con `supabase gen types typescript --linked > lib/database.types.ts`
para que queden exactos.

## Cuentas de staff

No hay registro público — las cuentas de Stay Fresh se crean manualmente:

1. Supabase Dashboard → Authentication → Users → Invite user (o
   `supabase.auth.admin.inviteUserByEmail` desde un script).
2. El trigger `handle_new_user` inserta automáticamente la fila en
   `profiles` con `role = 'staff'`.
3. Para dar permisos de admin, actualiza manualmente esa fila:
   `update public.profiles set role = 'admin' where email = '...';`

Login en `/auth/login`.

## Zonas de cobertura

La tabla `coverage_zones` se siembra con colonias **placeholder** de CDMX
(`supabase/migrations/20260706120300_seed_data.sql`) solo para poder probar
el flujo de agendamiento. Antes de ir a producción, reemplázalas con la
lista real de colonias/CP donde Stay Fresh recolecta — puedes hacerlo desde
`/admin/zonas`, sin necesidad de tocar código ni redeploy.

## Identidad de marca

Los tokens de color (`tailwind.config.ts`) y la tipografía display
(`app/fonts.ts`, actualmente Anton de Google Fonts) son **placeholder**
mientras se confirma el hex exacto del acento y la tipografía real de marca
a partir de los assets en `Cara Rara/Stay Fresh/assets/` (PNGs del case
study, no extraíbles como código). Ajustar cuando se tengan los assets
finales — no bloquea el resto del build.

## WhatsApp Business — checklist manual (bloquea Fase 3 en producción)

El bot de WhatsApp (`lib/whatsapp.ts`, `app/api/whatsapp/webhook/route.ts`)
está construido y gateado por variables de entorno — mientras
`WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_ACCESS_TOKEN` estén vacíos, el envío
queda inerte (loguea un warning, nunca lanza excepción ni bloquea un cambio
de status). Ninguno de estos pasos se puede hacer por código:

1. Cuenta de Meta Business Manager (business.facebook.com) para Stay Fresh.
2. App de WhatsApp Business Platform en Meta for Developers, ligada a esa
   Business Manager.
3. Verificación de negocio (documentos — puede tardar días, empezar cuanto
   antes).
4. Número dedicado para WhatsApp Business API (si se quiere migrar el
   número actual de WhatsApp Business normal, se requiere el flujo de
   migración de Meta).
5. Token de acceso **permanente** (System User en Meta Business Settings,
   no el token temporal de 24h del quickstart).
6. Anotar `PHONE_NUMBER_ID` y `WABA_ID` del dashboard de Meta.
7. Configurar la URL del webhook en el dashboard de Meta:
   `https://<dominio-de-producción>/api/whatsapp/webhook`, con un
   `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (cualquier string que tú elijas),
   suscrito al campo `messages`.
8. Enviar y esperar aprobación de al menos una plantilla de mensaje
   (necesaria para mensajes iniciados por el negocio fuera de la ventana de
   24h — ej. "tu pedido está listo") vía el Template Manager de Meta.
   Aprobación puede tardar 24–48h.

**Por qué Meta Cloud API directo y no Twilio/360dialog**: ambas rutas
requieren la misma verificación de Meta Business Manager (el verdadero
cuello de botella), así que un BSP no ahorra tiempo de arranque — pero sí
agrega una comisión extra por mensaje sobre la de Meta. Ir directo evita un
proveedor y una factura adicionales.

Una vez completado el checklist, llena las variables `WHATSAPP_*` en
`.env.local` / en Vercel y prueba con el webhook test tool del dashboard de
Meta antes de considerar la Fase 3 lista para producción.

## Verificación end-to-end

1. `npm run dev` — la home carga sin errores de consola.
2. Migraciones aplicadas, tablas visibles en Supabase Studio.
3. `/agendar`: colonia cubierta → habilita el envío; colonia no cubierta →
   bloquea. Enviar un booking con 2+ categorías y confirmar que
   `pickups.total_items` cuadra.
4. Login en `/auth/login`, mover una recolección por todos los status en
   `/admin/recolecciones/[id]`, revisar `/admin/clientes/[id]` (totales
   acumulados correctos), agregar una zona en `/admin/zonas` y confirmar
   que aparece de inmediato en `/agendar`.
5. Webhook de WhatsApp sin credenciales reales: confirmar que
   `updatePickupStatusAction` no falla aunque WhatsApp esté sin configurar.
   Simular el handshake:
   ```
   curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=12345"
   ```
   debe responder `12345` con 200. Simular un mensaje entrante con un
   payload con la forma de `entry[0].changes[0].value.messages[0]` contra
   el mismo endpoint por POST.
6. `npm run build` y `npm run typecheck` limpios.
