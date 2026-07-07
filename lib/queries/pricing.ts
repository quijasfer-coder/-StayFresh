import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;
export type PriceTier = Database["public"]["Tables"]["price_tiers"]["Row"];

/** Paquetes activos — usar con `createPublicClient()` desde el formulario de agendar. */
export async function listActivePriceTiers(supabase: Client): Promise<PriceTier[]> {
  const { data, error } = await supabase
    .from("price_tiers")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("display_order", { ascending: true })
    .order("quantity", { ascending: true });
  if (error) throw error;
  return data;
}

/** Todos los paquetes (incluye inactivos) — para el panel admin. */
export async function listAllPriceTiers(supabase: Client): Promise<PriceTier[]> {
  const { data, error } = await supabase
    .from("price_tiers")
    .select("*")
    .order("category", { ascending: true })
    .order("display_order", { ascending: true })
    .order("quantity", { ascending: true });
  if (error) throw error;
  return data;
}
