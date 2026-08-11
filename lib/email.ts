import { createServiceClient } from "@/lib/supabase/service";
import { formatDateEs } from "@/lib/format";

/**
 * Notificación por correo a los admins cuando entra una recolección nueva
 * (Brevo transactional email API). Queda inerte (loguea y no lanza
 * excepción) hasta que BREVO_API_KEY y BREVO_FROM_EMAIL existan — ver
 * checklist en el README antes de ir a producción.
 */
function isConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
}

type SendResult = { ok: boolean; error?: string };

function centsToMxn(cents: number): string {
  return (cents / 100).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

/** Llamado desde submitBookingAction tras un alta exitosa. Nunca bloquea el booking si falla. */
export async function notifyAdminsNewBooking(pickupId: string): Promise<SendResult> {
  if (!isConfigured()) {
    console.warn("[email] no configurado — omitiendo notificación (modo inerte)", { pickupId });
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  const supabase = createServiceClient();

  const [{ data: pickup }, { data: admins }] = await Promise.all([
    supabase
      .from("pickups")
      .select("id, scheduled_date, colonia, address, total_price_cents, clients(full_name, phone), pickup_items(category, quantity, description)")
      .eq("id", pickupId)
      .maybeSingle(),
    supabase.from("profiles").select("email").eq("role", "admin"),
  ]);

  if (!pickup) return { ok: false, error: "PICKUP_NOT_FOUND" };

  const to = admins?.map((admin) => ({ email: admin.email })) ?? [];
  if (to.length === 0) return { ok: false, error: "NO_ADMINS" };

  const client = pickup.clients;
  const itemsList = pickup.pickup_items
    .map((item) => `- ${item.quantity}x ${item.category}${item.description ? ` (${item.description})` : ""}`)
    .join("\n");
  const detailUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/recolecciones/${pickup.id}`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: process.env.BREVO_FROM_EMAIL, name: "Stay Fresh" },
      to,
      subject: `Nueva recolección — ${client?.full_name ?? "cliente"} (${formatDateEs(pickup.scheduled_date)})`,
      textContent: [
        `Nueva recolección agendada.`,
        ``,
        `Cliente: ${client?.full_name ?? "-"}`,
        `Teléfono: ${client?.phone ?? "-"}`,
        `Dirección: ${pickup.address ?? "-"}, ${pickup.colonia}`,
        `Fecha: ${formatDateEs(pickup.scheduled_date)}`,
        `Total: ${centsToMxn(pickup.total_price_cents)}`,
        ``,
        `Piezas:`,
        itemsList,
        ``,
        `Ver detalle: ${detailUrl}`,
      ].join("\n"),
    }),
  });

  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}
