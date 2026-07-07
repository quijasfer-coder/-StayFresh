import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDateEs } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const { data: upcoming } = await supabase
    .from("pickups")
    .select("*, clients(full_name, phone)")
    .gte("scheduled_date", today)
    .lte("scheduled_date", in7Days)
    .order("scheduled_date", { ascending: true });

  const { count: pendingCount } = await supabase
    .from("pickups")
    .select("*", { count: "exact", head: true })
    .not("status", "in", "(entregado,cancelada)");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-bone-mute mt-1">{pendingCount ?? 0} recolecciones activas</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <p className="eyebrow mb-4">Próximos 7 días</p>
        <ul className="space-y-3">
          {(upcoming ?? []).map((pickup) => (
            <li key={pickup.id} className="flex items-center justify-between">
              <Link href={`/admin/recolecciones/${pickup.id}`} className="hover:text-accent">
                <span className="font-medium">{pickup.clients?.full_name}</span>
                <span className="text-bone-mute text-sm ml-2">{formatDateEs(pickup.scheduled_date)}</span>
              </Link>
              <StatusBadge status={pickup.status} />
            </li>
          ))}
          {(upcoming ?? []).length === 0 && (
            <li className="text-bone-mute text-sm">No hay recolecciones agendadas esta semana.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
