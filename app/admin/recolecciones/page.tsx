import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listPickups, type PickupStatus } from "@/lib/queries/pickups";
import { STATUS_LABELS } from "@/components/admin/status-badge";
import { StatusSelect } from "@/components/admin/status-select";
import { CopyButton } from "@/components/admin/copy-button";
import { formatDateEs, formatMXN } from "@/lib/format";

export const metadata = { title: "Recolecciones" };

export default async function RecoleccionesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: PickupStatus }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const pickups = await listPickups(supabase, { status });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold uppercase text-3xl">Recolecciones</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink label="Todas" href="/admin/recolecciones" active={!status} />
        {(Object.keys(STATUS_LABELS) as PickupStatus[]).map((s) => (
          <FilterLink
            key={s}
            label={STATUS_LABELS[s]}
            href={`/admin/recolecciones?status=${s}`}
            active={status === s}
          />
        ))}
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-bone-mute border-b border-bone-border/30">
                <th className="px-5 py-3 whitespace-nowrap">Cliente</th>
                <th className="px-5 py-3 whitespace-nowrap">Colonia</th>
                <th className="px-5 py-3 whitespace-nowrap">Dirección</th>
                <th className="px-5 py-3 whitespace-nowrap">Fecha</th>
                <th className="px-5 py-3 whitespace-nowrap">Piezas</th>
                <th className="px-5 py-3 whitespace-nowrap">Total</th>
                <th className="px-5 py-3 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((pickup) => (
                <tr
                  key={pickup.id}
                  className="border-b border-bone-border/10 last:border-0 hover:bg-bone/5 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Link href={`/admin/recolecciones/${pickup.id}`} className="hover:text-accent">
                      {pickup.clients?.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-bone-mute whitespace-nowrap">{pickup.colonia}</td>
                  <td className="px-5 py-4 text-bone-mute">
                    <div className="flex items-center gap-1.5 max-w-[220px]">
                      <span className="truncate">{pickup.address ?? "—"}</span>
                      {pickup.address && <CopyButton text={pickup.address} />}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-bone-mute whitespace-nowrap">{formatDateEs(pickup.scheduled_date)}</td>
                  <td className="px-5 py-4 text-bone-mute whitespace-nowrap">
                    {pickup.total_items} {pickup.total_items === 1 ? "pieza" : "piezas"}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {pickup.total_price_cents > 0 ? formatMXN(pickup.total_price_cents) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <StatusSelect pickupId={pickup.id} status={pickup.status} />
                  </td>
                </tr>
              ))}
              {pickups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-bone-mute">
                    No hay recolecciones{status ? ` en status "${STATUS_LABELS[status]}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
        active ? "bg-bone text-ink" : "bg-ink-surface text-bone-mute hover:text-bone"
      }`}
    >
      {label}
    </Link>
  );
}
