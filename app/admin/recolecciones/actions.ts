"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { notifyStatusChange } from "@/lib/whatsapp";
import type { PickupStatus } from "@/lib/queries/pickups";

export type ActionResult = { ok: true } | { ok: false; error: string };

const ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHORIZED: "No tienes permiso para actualizar esta recolección.",
  PICKUP_NOT_FOUND: "Esa recolección ya no existe.",
};

function mapPgError(raw: string): string {
  const code = raw.split(/[\n:]/)[0].trim();
  return ERROR_MESSAGES[code] ?? "No pudimos actualizar el status.";
}

export async function updatePickupStatusAction(
  pickupId: string,
  status: PickupStatus,
): Promise<ActionResult> {
  await requireAuth(`/admin/recolecciones/${pickupId}`);
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_pickup_status", {
    p_pickup_id: pickupId,
    p_status: status,
  });

  if (error) {
    return { ok: false, error: mapPgError(error.message) };
  }

  // No debe bloquear el update si WhatsApp aún no está configurado o falla.
  await notifyStatusChange(pickupId, status);

  revalidatePath(`/admin/recolecciones/${pickupId}`);
  revalidatePath("/admin/recolecciones");
  revalidatePath("/admin");
  return { ok: true };
}
