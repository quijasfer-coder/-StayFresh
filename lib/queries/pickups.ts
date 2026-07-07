import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;
export type PickupStatus = Database["public"]["Enums"]["pickup_status"];

export async function listPickups(
  supabase: Client,
  filters?: { status?: PickupStatus; scheduledDate?: string },
) {
  let query = supabase
    .from("pickups")
    .select("*, clients(full_name, phone, colonia)")
    .order("scheduled_date", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.scheduledDate) query = query.eq("scheduled_date", filters.scheduledDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPickupDetail(supabase: Client, pickupId: string) {
  const { data, error } = await supabase
    .from("pickups")
    .select("*, clients(*), pickup_items(*), pickup_status_history(*)")
    .eq("id", pickupId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
