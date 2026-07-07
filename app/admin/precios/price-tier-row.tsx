"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { formatMXN, pluralizeItems } from "@/lib/format";
import { togglePriceTierActiveAction } from "./actions";
import { PriceTierForm } from "./price-tier-form";
import { CATEGORY_LABEL } from "@/lib/categories";
import type { Database } from "@/lib/database.types";

type ItemCategory = Database["public"]["Enums"]["item_category"];
type Tier = { id: string; category: ItemCategory; quantity: number; price_cents: number; active: boolean };

export function PriceTierRow({ tier }: { tier: Tier }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <tr className="border-b border-bone-border/10">
        <td colSpan={4} className="px-5 py-4">
          <PriceTierForm tier={tier} onDone={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-bone-border/10 last:border-0">
      <td className="px-5 py-4 whitespace-nowrap">{CATEGORY_LABEL[tier.category]}</td>
      <td className="px-5 py-4 text-bone-mute whitespace-nowrap">{pluralizeItems(tier.quantity, tier.category)}</td>
      <td className="px-5 py-4 whitespace-nowrap">{formatMXN(tier.price_cents)}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap",
              tier.active ? "bg-success/15 text-success" : "bg-bone-mute/15 text-bone-mute",
            )}
          >
            {tier.active ? "Activo" : "Inactivo"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-bone-mute hover:text-bone whitespace-nowrap"
          >
            Editar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await togglePriceTierActiveAction(tier.id, !tier.active);
              })
            }
            className="text-xs text-bone-mute hover:text-bone disabled:opacity-50 whitespace-nowrap"
          >
            {tier.active ? "Desactivar" : "Activar"}
          </button>
        </div>
      </td>
    </tr>
  );
}
