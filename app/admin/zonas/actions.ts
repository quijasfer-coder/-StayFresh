"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ZoneInput = {
  colonia: string;
  cp?: string;
  alcaldia?: string;
  notes?: string;
};

export async function createZoneAction(input: ZoneInput): Promise<ActionResult> {
  await requireAuth("/admin/zonas");
  const supabase = await createClient();

  const { error } = await supabase.from("coverage_zones").insert({
    colonia: input.colonia,
    cp: input.cp || null,
    alcaldia: input.alcaldia || null,
    notes: input.notes || null,
  });

  if (error) return { ok: false, error: friendlyError(error.message) };

  revalidatePath("/admin/zonas");
  revalidatePath("/agendar");
  return { ok: true };
}

export async function updateZoneAction(zoneId: string, input: ZoneInput): Promise<ActionResult> {
  await requireAuth("/admin/zonas");
  const supabase = await createClient();

  const { error } = await supabase
    .from("coverage_zones")
    .update({
      colonia: input.colonia,
      cp: input.cp || null,
      alcaldia: input.alcaldia || null,
      notes: input.notes || null,
    })
    .eq("id", zoneId);

  if (error) return { ok: false, error: friendlyError(error.message) };

  revalidatePath("/admin/zonas");
  revalidatePath("/agendar");
  return { ok: true };
}

/** Desactivación lógica — no se borra físicamente para preservar el snapshot histórico en pickups. */
export async function toggleZoneActiveAction(zoneId: string, active: boolean): Promise<ActionResult> {
  await requireAuth("/admin/zonas");
  const supabase = await createClient();

  const { error } = await supabase
    .from("coverage_zones")
    .update({ active })
    .eq("id", zoneId);

  if (error) return { ok: false, error: friendlyError(error.message) };

  revalidatePath("/admin/zonas");
  revalidatePath("/agendar");
  return { ok: true };
}

function friendlyError(message: string): string {
  if (message.includes("coverage_zones_colonia_cp_unique")) {
    return "Ya existe una zona con esa colonia y CP.";
  }
  return "No pudimos guardar la zona. Intenta de nuevo.";
}
