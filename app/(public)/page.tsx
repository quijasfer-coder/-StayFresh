import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Truck, Sparkles, PackageCheck, ShieldCheck } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { VideoShowcase } from "@/components/ui/video-showcase";
import { CATEGORY_LABEL, CATEGORY_IMAGE, CATEGORY_ORDER } from "@/lib/categories";

const STEPS = [
  { icon: Truck, title: "Recolectamos", body: "Vamos por tus piezas a tu domicilio, dentro de nuestra zona de cobertura." },
  { icon: Sparkles, title: "Limpiamos", body: "Cada material recibe el producto y técnica que necesita — nada de trato genérico." },
  { icon: PackageCheck, title: "Entregamos", body: "En aproximadamente una semana, de vuelta en tu puerta." },
  { icon: ShieldCheck, title: "Pagas al final", body: "Pago contra entrega, con garantía de satisfacción." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-background.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/60 to-ink" />
        </div>

        <div className="container min-h-[92vh] sm:min-h-screen flex flex-col justify-end pb-16 sm:pb-24 pt-16">
          <span className="glass-pill eyebrow inline-block rounded-full px-4 py-2 w-fit">
            Lavado profesional de sneakers · CDMX
          </span>
          <h1 className="font-display font-bold uppercase leading-[0.95] mt-6 text-4xl sm:text-6xl md:text-7xl">
            Tratamos tus tenis
            <br />
            <span className="text-outline-accent">como lo que son.</span>
          </h1>
          <p className="text-bone-mute max-w-lg mt-6 text-lg">
            No somos una tintorería. Cada par recibe el producto y la técnica
            que su material necesita — recolecta a domicilio, pago contra
            entrega, garantía de satisfacción.
          </p>
          <Link href="/agendar" className="btn-primary px-8 py-4 mt-8 text-sm w-fit">
            Agendar mi recolecta
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="container py-20">
        <VideoShowcase src="/videos/animo-showcase-stream-1080p.webm" logoSrc="/images/stay-fresh-logo.png" />
      </section>

      <section className="container py-20">
        <SectionTitle eyebrow="El proceso" title="Cómo funciona" className="mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card rounded-2xl p-6">
              <div className="w-14 h-14 rounded-lg bg-ink flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-bold uppercase text-xl mb-2">{title}</h3>
              <p className="text-sm text-bone-mute">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <SectionTitle eyebrow="Catálogo" title="Qué limpiamos" className="mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_ORDER.map((category) => (
            <Link
              key={category}
              href="/servicios"
              className="card group relative overflow-hidden rounded-2xl aspect-[3/4]"
            >
              <Image
                src={CATEGORY_IMAGE[category]}
                alt={CATEGORY_LABEL[category]}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/10" />
              <p className="absolute bottom-4 left-0 right-0 text-center font-display font-bold uppercase text-2xl">
                {CATEGORY_LABEL[category]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
