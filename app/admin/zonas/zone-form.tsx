"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Plus, Pencil } from "lucide-react";
import { createZoneAction, updateZoneAction, type ZoneInput } from "./actions";

type Zone = { id: string; colonia: string; cp: string | null; alcaldia: string | null; notes: string | null };

export function ZoneForm({ zone, onDone }: { zone?: Zone; onDone?: () => void }) {
  const [colonia, setColonia] = useState(zone?.colonia ?? "");
  const [cp, setCp] = useState(zone?.cp ?? "");
  const [alcaldia, setAlcaldia] = useState(zone?.alcaldia ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: ZoneInput = { colonia, cp, alcaldia };
    startTransition(async () => {
      const result = zone ? await updateZoneAction(zone.id, input) : await createZoneAction(input);
      if (result.ok) {
        if (!zone) {
          setColonia("");
          setCp("");
          setAlcaldia("");
        }
        onDone?.();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-1.5">
          Colonia
        </label>
        <input
          required
          value={colonia}
          onChange={(e) => setColonia(e.target.value)}
          className="bg-ink-surface border border-bone-border/40 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-1.5">
          CP
        </label>
        <input
          value={cp}
          onChange={(e) => setCp(e.target.value)}
          className="bg-ink-surface border border-bone-border/40 rounded-lg px-3 py-2 text-sm w-24 focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-1.5">
          Alcaldía
        </label>
        <input
          value={alcaldia}
          onChange={(e) => setAlcaldia(e.target.value)}
          className="bg-ink-surface border border-bone-border/40 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 bg-bone text-ink rounded-full px-4 py-2 text-sm font-medium hover:bg-accent hover:text-bone transition-colors disabled:opacity-50"
      >
        {zone ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        {pending ? "Guardando…" : zone ? "Guardar" : "Agregar zona"}
      </button>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-danger w-full">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </form>
  );
}
