import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listClientsWithTotals } from "@/lib/queries/clients";
import { formatPhone } from "@/lib/format";

export const metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const supabase = await createClient();
  const clients = await listClientsWithTotals(supabase);

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold uppercase text-3xl">Clientes</h1>

      <div className="card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-bone-mute border-b border-bone-border/30">
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Colonia</th>
              <th className="px-5 py-3">Recolecciones</th>
              <th className="px-5 py-3">Piezas totales</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-bone-border/10 last:border-0 hover:bg-bone/5 transition-colors"
              >
                <td className="px-5 py-4">
                  <Link href={`/admin/clientes/${client.id}`} className="hover:text-accent">
                    {client.full_name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-bone-mute">{formatPhone(client.phone)}</td>
                <td className="px-5 py-4 text-bone-mute">{client.colonia ?? "—"}</td>
                <td className="px-5 py-4 text-bone-mute">{client.total_pickups}</td>
                <td className="px-5 py-4 text-bone-mute">{client.total_items}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-bone-mute">
                  Aún no hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
