import Link from "next/link";
import { ArrowRight, Truck, Sparkles, PackageCheck, ShieldCheck } from "lucide-react";

const STEPS = [
  { icon: Truck, title: "Recolectamos", body: "Vamos por tus piezas a tu domicilio, dentro de nuestra zona de cobertura." },
  { icon: Sparkles, title: "Limpiamos", body: "Cada material recibe el producto y técnica que necesita — nada de trato genérico." },
  { icon: PackageCheck, title: "Entregamos", body: "En aproximadamente una semana, de vuelta en tu puerta." },
  { icon: ShieldCheck, title: "Pagas al final", body: "Pago contra entrega, con garantía de satisfacción." },
];

const CATEGORIES = ["Sneakers", "Botas", "Gorras", "Bolsas"];

export default function HomePage() {
  return (
    <>
      <section className="container pt-20 pb-24">
        <span className="glass-pill eyebrow inline-block rounded-full px-4 py-2">
          Lavado profesional de sneakers · CDMX
        </span>
        <h1 className="font-display font-semibold text-5xl md:text-7xl leading-[0.95] mt-6 max-w-3xl">
          Tratamos tus tenis
          <br />
          <span className="text-accent">como lo que son.</span>
        </h1>
        <p className="text-bone-mute max-w-lg mt-6 text-lg">
          No somos una tintorería. Cada par recibe el producto y la técnica
          que su material necesita — recolecta a domicilio, pago contra
          entrega, garantía de satisfacción.
        </p>
        <Link
          href="/agendar"
          className="group inline-flex items-center gap-2 bg-bone text-ink rounded-full px-6 py-3.5 font-medium mt-8 hover:bg-accent hover:text-bone transition-colors"
        >
          Agendar mi recolecta
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </section>

      <section className="container py-20">
        <h2 className="eyebrow mb-8">Cómo funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass rounded-3xl p-6">
              <Icon className="w-6 h-6 text-accent mb-4" />
              <h3 className="font-display font-semibold text-xl mb-2">{title}</h3>
              <p className="text-sm text-bone-mute">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <h2 className="eyebrow mb-8">Qué limpiamos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <div
              key={category}
              className="glass rounded-3xl p-8 text-center hover:border-accent/50 transition-colors"
            >
              <p className="font-display font-semibold text-2xl">{category}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="glass rounded-3xl p-10 md:p-16 text-center">
          <h2 className="font-display font-semibold text-3xl md:text-4xl mb-4">
            ¿Listo para agendar tu recolecta?
          </h2>
          <p className="text-bone-mute mb-8">
            Dinos qué necesitas limpiar y checamos si estamos en tu zona.
          </p>
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 bg-bone text-ink rounded-full px-6 py-3.5 font-medium hover:bg-accent hover:text-bone transition-colors"
          >
            Agendar ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
