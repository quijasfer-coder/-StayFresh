import { createClient } from "@/lib/supabase/server";
import { listAllPriceTiers } from "@/lib/queries/pricing";
import { PriceTierForm } from "./price-tier-form";
import { PriceTierRow } from "./price-tier-row";

export const metadata = { title: "Precios" };

export default async function PreciosPage() {
  const supabase = await createClient();
  const tiers = await listAllPriceTiers(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold uppercase text-3xl">Precios</h1>
        <p className="text-bone-mute mt-1 text-sm">
          Define paquetes por categoría y cantidad (ej. 1 par, 3 pares, 5 pares) — se reflejan
          de inmediato en el total del formulario público de agendamiento.
        </p>
      </div>

      <div className="card rounded-2xl p-6">
        <p className="eyebrow mb-4">Agregar paquete</p>
        <PriceTierForm />
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-bone-mute border-b border-bone-border/30">
                <th className="px-5 py-3 whitespace-nowrap">Categoría</th>
                <th className="px-5 py-3 whitespace-nowrap">Cantidad</th>
                <th className="px-5 py-3 whitespace-nowrap">Precio</th>
                <th className="px-5 py-3 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <PriceTierRow key={tier.id} tier={tier} />
              ))}
              {tiers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-bone-mute">
                    Sin paquetes configurados todavía.
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
