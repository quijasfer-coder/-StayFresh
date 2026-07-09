import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-4 z-40 px-4">
        <nav className="glass-nav container mx-auto flex items-center justify-between gap-3 rounded-xl px-6 py-3">
          <Link href="/" className="font-display font-semibold text-xl tracking-tight whitespace-nowrap">
            Stay Fresh
          </Link>
          <div className="flex items-center gap-3 sm:gap-8 text-sm">
            <Link
              href="/servicios"
              className="uppercase tracking-wide text-bone-mute hover:text-accent transition-colors"
            >
              Servicios
            </Link>
            <Link href="/agendar" className="btn-primary px-4 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-sm">
              <span className="sm:hidden">Agendar</span>
              <span className="hidden sm:inline">Agendar recolecta</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer>
        <div className="container py-20 text-center">
          <span className="eyebrow text-accent">¿Listo para empezar?</span>
          <h2 className="font-display font-bold uppercase leading-[0.95] mt-3 text-5xl sm:text-6xl md:text-7xl">
            Agenda tu
            <br />
            recolecta hoy.
          </h2>
          <Link href="/agendar" className="btn-primary px-8 py-4 mt-8 text-sm">
            Empezar ahora
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="border-t border-bone-border/[0.16] bg-ink-surface">
          <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-bone-mute">
            <span>© {new Date().getFullYear()} Stay Fresh</span>
            <span className="eyebrow">Tratamos tus tenis como lo que son</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
