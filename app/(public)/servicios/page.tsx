import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/server";
import { listActiveServices } from "@/lib/queries/services";
import { SectionTitle } from "@/components/ui/section-title";
import { CATEGORY_LABEL, CATEGORY_IMAGE } from "@/lib/categories";

export const metadata = { title: "Servicios" };
// El catálogo es editable por staff — nunca generar estático en build time,
// siempre leer en request time para reflejar cambios sin redeploy.
export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const supabase = createPublicClient();
  const services = await listActiveServices(supabase);

  return (
    <section className="container py-20">
      <SectionTitle eyebrow="Catálogo" title="Nuestros servicios" className="mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card relative overflow-hidden rounded-2xl min-h-[220px] flex items-end">
            <Image
              src={CATEGORY_IMAGE[service.category]}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
            <div className="relative p-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                {CATEGORY_LABEL[service.category] ?? service.category}
              </span>
              <h2 className="font-display font-bold uppercase text-2xl mt-2 text-white">{service.name}</h2>
              {service.description && (
                <p className="text-sm text-white/70 mt-2">{service.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
