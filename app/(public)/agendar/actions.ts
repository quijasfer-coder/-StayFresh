"use server";

import { createPublicClient } from "@/lib/supabase/server";
import { checkCoverage } from "@/lib/queries/coverage";
import type { Database } from "@/lib/database.types";

export type BookingItemInput = {
  category: Database["public"]["Enums"]["item_category"];
  quantity: number;
  description?: string;
  priceCents?: number | null;
  photoUrl?: string | null;
};

export type BookingPayload = {
  fullName: string;
  phone: string;
  address: string;
  colonia: string;
  cp: string;
  scheduledDate: string;
  items: BookingItemInput[];
};

export type BookingResult =
  | { ok: true; pickupId: string }
  | { ok: false; error: string };

const ERROR_MESSAGES: Record<string, string> = {
  ZONE_NOT_COVERED: "Todavía no llegamos a tu colonia — pronto ampliaremos cobertura.",
  NO_ITEMS: "Agrega al menos una pieza para agendar tu recolecta.",
};

function mapPgError(raw: string): string {
  const code = raw.split(/[\n:]/)[0].trim();
  return ERROR_MESSAGES[code] ?? "No pudimos agendar tu recolecta. Intenta de nuevo.";
}

export type CoverageResult = { ok: true; covered: boolean } | { ok: false; error: string };

/**
 * Checkeo de cobertura para el formulario público — sin sesión, anónimo.
 * Nunca deja que un error de red/DB se propague como excepción no
 * atrapada hacia el cliente (eso tumbaría toda la página) — lo convierte
 * en un resultado manejable por el formulario.
 */
export async function checkCoverageAction(
  colonia: string,
  cp: string,
): Promise<CoverageResult> {
  try {
    const supabase = createPublicClient();
    const covered = await checkCoverage(supabase, colonia || null, cp || null);
    return { ok: true, covered };
  } catch {
    return { ok: false, error: "No pudimos verificar tu zona. Intenta de nuevo." };
  }
}

/** Alta de recolección desde el formulario público. Re-valida cobertura server-side dentro del RPC. */
export async function submitBookingAction(
  payload: BookingPayload,
): Promise<BookingResult> {
  try {
    const supabase = createPublicClient();

    const { data, error } = await supabase.rpc("create_public_booking", {
      p_full_name: payload.fullName,
      p_phone: payload.phone,
      p_address: payload.address || null,
      p_colonia: payload.colonia,
      p_cp: payload.cp || null,
      p_scheduled_date: payload.scheduledDate,
      p_items: payload.items.map((item) => ({
        category: item.category,
        quantity: item.quantity,
        description: item.description,
        price_cents: item.priceCents ?? null,
        photo_url: item.photoUrl ?? null,
      })),
    });

    if (error) {
      return { ok: false, error: mapPgError(error.message) };
    }

    return { ok: true, pickupId: data as string };
  } catch {
    return { ok: false, error: "No pudimos agendar tu recolecta. Intenta de nuevo." };
  }
}
