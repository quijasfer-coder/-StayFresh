"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Plus, Pencil } from "lucide-react";
import { createPriceTierAction, updatePriceTierAction, type PriceTierInput } from "./actions";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";
import type { Database } from "@/lib/database.types";

type ItemCategory = Database["public"]["Enums"]["item_category"];
type Tier = { id: string; category: ItemCategory; quantity: number; price_cents: number };

export function PriceTierForm({ tier, onDone }: { tier?: Tier; onDone?: () => void }) {
  const [category, setCategory] = useState<ItemCategory>(tier?.category ?? "tenis");
  const [quantity, setQuantity] = useState(tier?.quantity ?? 1);
  const [pesos, setPesos] = useState(tier ? (tier.price_cents / 100).toString() : "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceCents = Math.round(Number(pesos) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError("Precio inválido.");
      return;
    }
    const input: PriceTierInput = { category, quantity, priceCents };
    startTransition(async () => {
      const result = tier ? await updatePriceTierAction(tier.id, input) : await createPriceTierAction(input);
      if (result.ok) {
        if (!tier) {
          setQuantity(1);
          setPesos("");
        }
        onDone?.();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
      <div className="w-full sm:w-auto">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-1.5">
          Categoría
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ItemCategory)}
          className="w-full sm:w-44 bg-ink-surface border border-bone-border/40 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-auto">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-1.5">
          Cantidad
        </label>
        <input
          required
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full sm:w-24 bg-ink-surface border border-bone-border/40 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <div className="w-full sm:w-auto">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-bone-mute mb-1.5">
          Precio (MXN)
        </label>
        <input
          required
          type="number"
          min={0}
          step="0.01"
          value={pesos}
          onChange={(e) => setPesos(e.target.value)}
          placeholder="150.00"
          className="w-full sm:w-32 bg-ink-surface border border-bone-border/40 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary gap-1.5 px-4 py-2 text-xs disabled:opacity-50 w-full sm:w-auto"
      >
        {tier ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        {pending ? "Guardando…" : tier ? "Guardar" : "Agregar paquete"}
      </button>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-danger w-full">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </form>
  );
}
