import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWhatsappText } from "@/lib/whatsapp";

/**
 * Webhook de WhatsApp Business (Meta Cloud API). Inerte hasta completar
 * el setup manual descrito en el README (Meta Business Manager,
 * verificación, número dedicado, WHATSAPP_WEBHOOK_VERIFY_TOKEN, etc.).
 */

// Handshake de verificación que Meta llama al configurar el webhook.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Mensajes entrantes. Bot simple basado en reglas: responde con el
// status más reciente de la recolección del cliente que escribió.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!verifySignature(request, rawBody)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const message = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) {
    // Callbacks de status de mensajes salientes (delivered/read) — ignorar.
    return NextResponse.json({ ok: true });
  }

  const fromPhone: string = message.from;
  const supabase = createServiceClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("phone", fromPhone)
    .maybeSingle();

  let reply: string;
  if (!client) {
    reply = `Hola! No encontramos tu número registrado en Stay Fresh. Agenda tu primera recolecta en ${process.env.NEXT_PUBLIC_SITE_URL}/agendar`;
  } else {
    const { data: pickup } = await supabase
      .from("pickups")
      .select("status, scheduled_date")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    reply = pickup
      ? `Hola ${client.full_name}, tu recolección más reciente está: ${pickup.status}.`
      : `Hola ${client.full_name}, no tienes recolecciones activas. ¿Quieres agendar una en ${process.env.NEXT_PUBLIC_SITE_URL}/agendar?`;
  }

  await sendWhatsappText(fromPhone, reply);
  return NextResponse.json({ ok: true });
}

/**
 * Verifica la firma X-Hub-Signature-256 que Meta agrega a cada request.
 * Si WHATSAPP_APP_SECRET no está configurado (modo inerte/desarrollo sin
 * credenciales reales), se omite la verificación para no bloquear
 * pruebas locales con curl.
 */
function verifySignature(request: NextRequest, rawBody: string): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true;

  const signatureHeader = request.headers.get("x-hub-signature-256");
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(received, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}
