"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type PriceTierInput = {
  category: Database["public"]["Enums"]["item_category"];
  quantity: number;
  priceCents: number;
};

export async function createPriceTierAction(input: PriceTierInput): Promise<ActionResult> {
  await requireAuth("/admin/precios");
  const supabase = await createClient();

  const { error } = await supabase.from("price_tiers").insert({
    category: input.category,
    quantity: input.quantity,
    price_cents: input.priceCents,
  });

  if (error) return { ok: false, error: friendlyError(error.message) };

  revalidatePath("/admin/precios");
  revalidatePath("/agendar");
  return { ok: true };
}

export async function updatePriceTierAction(tierId: string, input: PriceTierInput): Promise<ActionResult> {
  await requireAuth("/admin/precios");
  const supabase = await createClient();

  const { error } = await supabase
    .from("price_tiers")
    .update({
      category: input.category,
      quantity: input.quantity,
      price_cents: input.priceCents,
    })
    .eq("id", tierId);

  if (error) return { ok: false, error: friendlyError(error.message) };

  revalidatePath("/admin/precios");
  revalidatePath("/agendar");
  return { ok: true };
}

/** Desactivación lógica — no se borra físicamente para no alterar el precio congelado en pickups históricos. */
export async function togglePriceTierActiveAction(tierId: string, active: boolean): Promise<ActionResult> {
  await requireAuth("/admin/precios");
  const supabase = await createClient();

  const { error } = await supabase.from("price_tiers").update({ active }).eq("id", tierId);

  if (error) return { ok: false, error: friendlyError(error.message) };

  revalidatePath("/admin/precios");
  revalidatePath("/agendar");
  return { ok: true };
}

function friendlyError(message: string): string {
  if (message.includes("price_tiers_category_quantity_key")) {
    return "Ya existe un paquete con esa categoría y cantidad.";
  }
  return "No pudimos guardar el paquete. Intenta de nuevo.";
}
