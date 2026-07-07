import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";

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
      <header className="glass-nav sticky top-0 z-40">
        <nav className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display font-semibold text-lg tracking-tight">
              Stay Fresh
            </Link>
            <div className="hidden sm:flex items-center gap-5 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-bone-mute hover:text-bone transition-colors"
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
                className="inline-flex items-center gap-1.5 text-bone-mute hover:text-bone transition-colors"
              >
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
