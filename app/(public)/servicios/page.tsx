import { createPublicClient } from "@/lib/supabase/server";
import { listActiveServices } from "@/lib/queries/services";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata = { title: "Servicios" };
// El catálogo es editable por staff — nunca generar estático en build time,
// siempre leer en request time para reflejar cambios sin redeploy.
export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  tenis: "Sneakers",
  botas: "Botas",
  gorras: "Gorras",
  bolsas: "Bolsas",
};

export default async function ServiciosPage() {
  const supabase = createPublicClient();
  const services = await listActiveServices(supabase);

  return (
    <section className="container py-20">
      <SectionTitle eyebrow="Catálogo" title="Nuestros servicios" className="mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card rounded-2xl p-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
              {CATEGORY_LABEL[service.category] ?? service.category}
            </span>
            <h2 className="font-display font-bold uppercase text-2xl mt-2">{service.name}</h2>
            {service.description && (
              <p className="text-sm text-bone-mute mt-2">{service.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
