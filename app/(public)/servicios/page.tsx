import { createPublicClient } from "@/lib/supabase/server";
import { listActiveServices } from "@/lib/queries/services";

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
      <span className="eyebrow">Catálogo</span>
      <h1 className="font-display text-4xl md:text-5xl mt-3 mb-10">
        Nuestros servicios
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-2xl border border-bone-border/40 p-6"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
              {CATEGORY_LABEL[service.category] ?? service.category}
            </span>
            <h2 className="font-display text-2xl mt-2">{service.name}</h2>
            {service.description && (
              <p className="text-sm text-bone-mute mt-2">{service.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
