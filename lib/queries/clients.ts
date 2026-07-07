import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/** Lista de clientes con totales acumulados — respaldada por la vista `client_totals`. */
export async function listClientsWithTotals(supabase: Client) {
  const { data, error } = await supabase
    .from("client_totals")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getClientDetail(supabase: Client, clientId: string) {
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();
  if (clientError) throw clientError;

  const { data: pickups, error: pickupsError } = await supabase
    .from("pickups")
    .select("*, pickup_items(*)")
    .eq("client_id", clientId)
    .order("scheduled_date", { ascending: false });
  if (pickupsError) throw pickupsError;

  // Desglose acumulado por categoría — "control de pares por cliente"
  const totalsByCategory: Record<string, number> = {};
  for (const pickup of pickups ?? []) {
    for (const item of pickup.pickup_items ?? []) {
      totalsByCategory[item.category] = (totalsByCategory[item.category] ?? 0) + item.quantity;
    }
  }

  return { client, pickups: pickups ?? [], totalsByCategory };
}
