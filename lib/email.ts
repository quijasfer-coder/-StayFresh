import { createServiceClient } from "@/lib/supabase/service";
import { formatDateEs, toWhatsappNumber } from "@/lib/format";

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const scheduledDateEs = formatDateEs(pickup.scheduled_date);
  const itemsList = pickup.pickup_items
    .map((item) => `- ${item.quantity}x ${item.category}${item.description ? ` (${item.description})` : ""}`)
    .join("\n");
  const detailUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/recolecciones/${pickup.id}`;

  const whatsappMessage = `Hola, somos de Stay Fresh! Te confirmamos tu recolecta el día ${scheduledDateEs}.`;
  const whatsappUrl = client?.phone
    ? `https://wa.me/${toWhatsappNumber(client.phone)}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

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
      subject: `Nueva recolección — ${client?.full_name ?? "cliente"} (${scheduledDateEs})`,
      textContent: [
        `Nueva recolección agendada.`,
        ``,
        `Cliente: ${client?.full_name ?? "-"}`,
        `Teléfono: ${client?.phone ?? "-"}`,
        `Dirección: ${pickup.address ?? "-"}, ${pickup.colonia}`,
        `Fecha: ${scheduledDateEs}`,
        `Total: ${centsToMxn(pickup.total_price_cents)}`,
        ``,
        `Piezas:`,
        itemsList,
        ``,
        ...(whatsappUrl ? [`Confirmar por WhatsApp: ${whatsappUrl}`, ``] : []),
        `Ver detalle: ${detailUrl}`,
      ].join("\n"),
      htmlContent: `
        <div style="font-family: -apple-system, Arial, sans-serif; font-size: 14px; color: #111;">
          <h2 style="margin-bottom: 4px;">Nueva recolección agendada</h2>
          <p style="margin: 0 0 16px;">
            <strong>Cliente:</strong> ${escapeHtml(client?.full_name ?? "-")}<br>
            <strong>Teléfono:</strong> ${escapeHtml(client?.phone ?? "-")}<br>
            <strong>Dirección:</strong> ${escapeHtml(pickup.address ?? "-")}, ${escapeHtml(pickup.colonia)}<br>
            <strong>Fecha:</strong> ${escapeHtml(scheduledDateEs)}<br>
            <strong>Total:</strong> ${escapeHtml(centsToMxn(pickup.total_price_cents))}
          </p>
          <p style="margin: 0 0 16px;">
            <strong>Piezas:</strong><br>
            ${pickup.pickup_items
              .map((item) => escapeHtml(`${item.quantity}x ${item.category}${item.description ? ` (${item.description})` : ""}`))
              .join("<br>")}
          </p>
          ${
            whatsappUrl
              ? `<p style="margin: 0 0 16px;">
                  <a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    Confirmar por WhatsApp
                  </a>
                </p>`
              : ""
          }
          <p style="margin: 0;">
            <a href="${detailUrl}">Ver detalle en el panel</a>
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}
