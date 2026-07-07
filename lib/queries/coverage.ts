import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/** Envuelve el RPC `check_coverage` — usable tanto con el cliente público (anon) como con el de staff. */
export async function checkCoverage(
  supabase: Client,
  colonia: string | null,
  cp: string | null,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_coverage", {
    p_colonia: colonia,
    p_cp: cp,
  });
  if (error) throw error;
  return data ?? false;
}

export async function listCoverageZones(supabase: Client) {
  const { data, error } = await supabase
    .from("coverage_zones")
    .select("*")
    .order("colonia", { ascending: true });
  if (error) throw error;
  return data;
}
