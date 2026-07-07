import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";
import { MobileNav } from "@/components/admin/mobile-nav";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/recolecciones", label: "Recolecciones" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/zonas", label: "Zonas" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-4 z-40 px-4">
        <nav className="glass-nav relative container mx-auto flex items-center justify-between gap-3 rounded-xl px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 sm:gap-8">
            <MobileNav items={NAV} />
            <Link href="/admin" className="font-display font-semibold text-lg tracking-tight">
              Stay Fresh
            </Link>
            <div className="hidden sm:flex items-center gap-5 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="uppercase tracking-wide text-bone-mute hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-bone-mute hidden sm:inline">{profile.full_name}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 uppercase tracking-wide text-bone-mute hover:text-accent transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
