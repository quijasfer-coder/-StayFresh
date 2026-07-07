"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleZoneActiveAction } from "./actions";
import { ZoneForm } from "./zone-form";

type Zone = {
  id: string;
  colonia: string;
  cp: string | null;
  alcaldia: string | null;
  notes: string | null;
  active: boolean;
};

export function ZoneRow({ zone }: { zone: Zone }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <tr className="border-b border-bone-border/10">
        <td colSpan={4} className="px-5 py-4">
          <ZoneForm zone={zone} onDone={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-bone-border/10 last:border-0">
      <td className="px-5 py-4">{zone.colonia}</td>
      <td className="px-5 py-4 text-bone-mute">{zone.cp ?? "—"}</td>
      <td className="px-5 py-4 text-bone-mute">{zone.alcaldia ?? "—"}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider",
              zone.active ? "bg-success/15 text-success" : "bg-bone-mute/15 text-bone-mute",
            )}
          >
            {zone.active ? "Activa" : "Inactiva"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-ink transition-colors"
          >
            <Pencil className="w-3 h-3" /> Editar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await toggleZoneActiveAction(zone.id, !zone.active);
              })
            }
            className="text-xs text-bone-mute hover:text-bone disabled:opacity-50"
          >
            {zone.active ? "Desactivar" : "Activar"}
          </button>
        </div>
      </td>
    </tr>
  );
}
