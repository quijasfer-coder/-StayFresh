import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-nav sticky top-0 z-40">
        <nav className="container flex items-center justify-between gap-3 py-4">
          <Link href="/" className="font-display font-semibold text-xl tracking-tight whitespace-nowrap">
            Stay Fresh
          </Link>
          <div className="flex items-center gap-3 sm:gap-6 text-sm">
            <Link
              href="/servicios"
              className="hidden sm:inline text-bone-mute hover:text-bone transition-colors"
            >
              Servicios
            </Link>
            <Link
              href="/agendar"
              className="bg-bone text-ink rounded-full px-4 py-2 font-medium hover:bg-accent hover:text-bone transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Agendar</span>
              <span className="hidden sm:inline">Agendar recolecta</span>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-bone-mute">
          <span>© {new Date().getFullYear()} Stay Fresh</span>
          <span className="eyebrow">Tratamos tus tenis como lo que son</span>
        </div>
      </footer>
    </div>
  );
}
