import { createClient } from "@/lib/supabase/server";
import { listCoverageZones } from "@/lib/queries/coverage";
import { ZoneForm } from "./zone-form";
import { ZoneRow } from "./zone-row";

export const metadata = { title: "Zonas de cobertura" };

export default async function ZonasPage() {
  const supabase = await createClient();
  const zones = await listCoverageZones(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold uppercase text-3xl">Zonas de cobertura</h1>
        <p className="text-bone-mute mt-1 text-sm">
          Agrega o desactiva colonias/CP sin necesidad de un redeploy — se refleja de inmediato en el formulario público de agendamiento.
        </p>
      </div>

      <div className="card rounded-2xl p-6">
        <p className="eyebrow mb-4">Agregar zona</p>
        <ZoneForm />
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-bone-mute border-b border-bone-border/30">
              <th className="px-5 py-3">Colonia</th>
              <th className="px-5 py-3">CP</th>
              <th className="px-5 py-3">Alcaldía</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <ZoneRow key={zone.id} zone={zone} />
            ))}
            {zones.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-bone-mute">
                  Sin zonas configuradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
