import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getClientDetail } from "@/lib/queries/clients";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDateEs, formatPhone } from "@/lib/format";

const CATEGORY_LABEL: Record<string, string> = {
  tenis: "Tenis / sneakers",
  botas: "Botas",
  gorras: "Gorras",
  bolsas: "Bolsas",
};

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { client, pickups, totalsByCategory } = await getClientDetail(supabase, id);

  if (!client) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-bone-mute hover:text-bone"
      >
        <ArrowLeft className="w-4 h-4" /> Clientes
      </Link>

      <div>
        <h1 className="font-display text-3xl">{client.full_name}</h1>
        <p className="text-bone-mute mt-1">
          {formatPhone(client.phone)} · {client.colonia ?? "Sin colonia"}
        </p>
        {client.address && <p className="text-bone-mute text-sm mt-1">{client.address}</p>}
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="eyebrow mb-4">Control de pares — acumulado histórico</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(CATEGORY_LABEL).map(([category, label]) => (
            <div key={category}>
              <p className="font-display text-3xl">{totalsByCategory[category] ?? 0}</p>
              <p className="text-xs text-bone-mute">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="eyebrow mb-4">Historial de recolecciones ({pickups.length})</p>
        <ul className="space-y-4">
          {pickups.map((pickup) => (
            <li key={pickup.id} className="border-b border-bone-border/10 pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <Link
                  href={`/admin/recolecciones/${pickup.id}`}
                  className="font-medium hover:text-accent"
                >
                  {formatDateEs(pickup.scheduled_date)}
                </Link>
                <StatusBadge status={pickup.status} />
              </div>
              <p className="text-sm text-bone-mute mt-1">
                {pickup.pickup_items
                  .map((item) => `${item.quantity}× ${CATEGORY_LABEL[item.category] ?? item.category}`)
                  .join(", ")}
              </p>
            </li>
          ))}
          {pickups.length === 0 && (
            <li className="text-bone-mute text-sm">Sin recolecciones todavía.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
