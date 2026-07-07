"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 -ml-2 text-bone-mute hover:text-accent transition-colors"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="glass-nav absolute left-0 right-0 top-full mt-2 z-40 rounded-xl p-2 flex flex-col">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 uppercase tracking-wide text-sm text-bone-mute hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
