import { createClient } from "@/lib/supabase/server";
import type { PickupStatus } from "@/lib/queries/pickups";

/**
 * Capa de WhatsApp Business (Meta Cloud API). Queda inerte (loguea y no
 * lanza excepción) hasta que WHATSAPP_PHONE_NUMBER_ID y
 * WHATSAPP_ACCESS_TOKEN existan — ver checklist de setup manual en el
 * README antes de ir a producción.
 */
function isConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN,
  );
}

type SendResult = { ok: boolean; error?: string };

/** Envía texto libre — solo válido dentro de la ventana de 24h de conversación (cliente escribió primero). */
export async function sendWhatsappText(to: string, body: string): Promise<SendResult> {
  if (!isConfigured()) {
    console.warn("[whatsapp] no configurado — omitiendo envío (modo inerte)", { to, body });
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

/**
 * Stub para mensajes de plantilla aprobada — necesarios fuera de la
 * ventana de 24h (ej. notificar un cambio de status iniciado por el
 * negocio). Completar `templateName`/`params` una vez que Meta apruebe
 * al menos una plantilla (paso manual, ver README).
 */
export async function sendTemplate(
  to: string,
  templateName: string,
  params: string[] = [],
): Promise<SendResult> {
  if (!isConfigured()) {
    console.warn("[whatsapp] no configurado — omitiendo envío de plantilla (modo inerte)", {
      to,
      templateName,
    });
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "es_MX" },
        components: params.length
          ? [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }]
          : undefined,
      },
    }),
  });

  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

export function statusMessage(status: PickupStatus, clientName: string): string {
  const MESSAGES: Record<PickupStatus, string> = {
    agendada: `Hola ${clientName}! Tu recolección Stay Fresh está agendada.`,
    recolectado: `Recogimos tus piezas. Ya están en camino al taller!`,
    en_proceso: `Tus piezas ya están en proceso de limpieza.`,
    listo: `Listo! Tus piezas están limpias y listas para regresar a casa.`,
    en_camino: `Vamos en camino a entregar tu pedido.`,
    entregado: `Entregado. Gracias por confiar en Stay Fresh — pago contra entrega.`,
    cancelada: `Tu recolección fue cancelada. Contáctanos si tienes dudas.`,
  };
  return MESSAGES[status];
}

/** Llamado desde updatePickupStatusAction tras un cambio de status exitoso. Nunca bloquea el update si falla. */
export async function notifyStatusChange(pickupId: string, status: PickupStatus): Promise<void> {
  const supabase = await createClient();

  const { data: pickup } = await supabase
    .from("pickups")
    .select("id, clients(full_name, phone)")
    .eq("id", pickupId)
    .maybeSingle();

  const client = pickup?.clients;
  if (!client) return;

  const result = await sendWhatsappText(client.phone, statusMessage(status, client.full_name));

  const { data: historyRow } = await supabase
    .from("pickup_status_history")
    .select("id")
    .eq("pickup_id", pickupId)
    .eq("status", status)
    .order("changed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historyRow) {
    await supabase
      .from("pickup_status_history")
      .update({ notified_whatsapp: result.ok })
      .eq("id", historyRow.id);
  }
}
