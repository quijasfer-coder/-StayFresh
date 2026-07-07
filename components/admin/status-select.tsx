"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { updatePickupStatusAction } from "@/app/admin/recolecciones/actions";
import { StatusBadge, STATUS_LABELS, STATUS_ORDER } from "@/components/admin/status-badge";
import type { PickupStatus } from "@/lib/queries/pickups";

const ALL_STATUSES: PickupStatus[] = [...STATUS_ORDER, "cancelada"];
const MENU_WIDTH = 176;

/**
 * Badge de status clickeable — abre un menú para cambiar el status sin
 * salir de la lista. El menú se pinta en un portal a document.body: la
 * tabla vive dentro de un contenedor `overflow-x-auto` (para poder hacer
 * scroll horizontal en mobile), y ese overflow también recorta el eje Y
 * por cómo el navegador calcula overflow-x/overflow-y juntos — sin portal
 * el dropdown queda invisible, recortado por ese contenedor.
 */
export function StatusSelect({ pickupId, status }: { pickupId: string; status: PickupStatus }) {
  const [current, setCurrent] = useState(status);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8);
    setMenuPos({ top: rect.bottom + 8, left: Math.max(left, 8) });
  }, [open]);

  function handleChange(next: PickupStatus) {
    setOpen(false);
    if (next === current) return;
    setError(null);
    startTransition(async () => {
      const result = await updatePickupStatusAction(pickupId, next);
      if (result.ok) {
        setCurrent(next);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        disabled={pending}
        className="disabled:opacity-50 cursor-pointer hover:ring-2 hover:ring-accent/40 rounded-full transition-shadow"
        title="Cambiar status"
      >
        <StatusBadge status={current} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
            <div
              className="fixed z-[110] rounded-xl border border-bone-border/[0.16] bg-ink-surface shadow-lg overflow-hidden"
              style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
            >
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleChange(s)}
                  className="w-full text-left px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-bone-mute hover:bg-ink hover:text-accent transition-colors"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
      {error && <p className="text-[10px] text-danger mt-1 max-w-[160px]">{error}</p>}
    </div>
  );
}
