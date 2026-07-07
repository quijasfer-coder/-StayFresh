import { cn } from "@/lib/utils";
import type { PickupStatus } from "@/lib/queries/pickups";

export const STATUS_LABELS: Record<PickupStatus, string> = {
  agendada: "Agendada",
  recolectado: "Recolectado",
  en_proceso: "En proceso",
  listo: "Listo",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelada: "Cancelada",
};

export const STATUS_ORDER: PickupStatus[] = [
  "agendada",
  "recolectado",
  "en_proceso",
  "listo",
  "en_camino",
  "entregado",
];

const STATUS_STYLES: Record<PickupStatus, string> = {
  agendada: "bg-bone-mute/15 text-bone-mute",
  recolectado: "bg-accent/15 text-accent",
  en_proceso: "bg-warning/15 text-warning",
  listo: "bg-success/15 text-success",
  en_camino: "bg-accent/15 text-accent",
  entregado: "bg-success/20 text-success",
  cancelada: "bg-danger/15 text-danger",
};

export function StatusBadge({ status }: { status: PickupStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
