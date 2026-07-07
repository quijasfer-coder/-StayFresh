import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Cliente Supabase con service-role — bypassa RLS por completo.
 *
 * SOLO para contextos server-to-server sin sesión de usuario, como el
 * webhook de WhatsApp (Meta llama directo, sin cookies de Supabase Auth).
 * `clients`/`pickups`/`pickup_items`/`pickup_status_history` NO son
 * legibles anónimamente por diseño (ver migración de RLS) — este cliente
 * es la única forma de que el webhook los consulte.
 *
 * Nunca importar este archivo desde un componente cliente ni exponer
 * `SUPABASE_SERVICE_ROLE_KEY` al navegador.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
