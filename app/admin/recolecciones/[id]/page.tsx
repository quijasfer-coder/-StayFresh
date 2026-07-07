import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPickupDetail } from "@/lib/queries/pickups";
import { StatusSelector } from "./status-selector";
import { formatDateEs, formatDateTimeEs, formatPhone } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  tenis: "Tenis / sneakers",
  botas: "Botas",
  gorras: "Gorras",
  bolsas: "Bolsas",
};

export default async function PickupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const pickup = await getPickupDetail(supabase, id);

  if (!pickup) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href="/admin/recolecciones"
        className="inline-flex items-center gap-1.5 text-sm text-bone-mute hover:text-bone"
      >
        <ArrowLeft className="w-4 h-4" /> Recolecciones
      </Link>

      <div>
        <h1 className="font-display text-3xl">{pickup.clients.full_name}</h1>
        <p className="text-bone-mute mt-1">
          {formatPhone(pickup.clients.phone)} · {pickup.colonia}
          {pickup.cp ? ` (${pickup.cp})` : ""}
        </p>
        {pickup.address && <p className="text-bone-mute text-sm mt-1">{pickup.address}</p>}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <p className="eyebrow">Status</p>
        <StatusSelector pickupId={pickup.id} currentStatus={pickup.status} />
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <p className="eyebrow">Piezas ({pickup.total_items})</p>
        <ul className="space-y-2 text-sm">
          {pickup.pickup_items.map((item) => (
            <li key={item.id} className="flex justify-between border-b border-bone-border/10 pb-2 last:border-0">
              <span>
                {item.quantity}× {CATEGORY_LABEL[item.category] ?? item.category}
                {item.description && <span className="text-bone-mute"> — {item.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <p className="eyebrow">Fecha agendada</p>
        <p className="text-sm">{formatDateEs(pickup.scheduled_date)}</p>
        {pickup.notes && (
          <>
            <p className="eyebrow mt-4">Notas</p>
            <p className="text-sm text-bone-mute">{pickup.notes}</p>
          </>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <p className="eyebrow">Historial</p>
        <ul className="space-y-2 text-sm">
          {pickup.pickup_status_history
            .slice()
            .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
            .map((entry) => (
              <li key={entry.id} className="flex justify-between text-bone-mute">
                <span>{entry.status}</span>
                <span>{formatDateTimeEs(entry.changed_at)}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
