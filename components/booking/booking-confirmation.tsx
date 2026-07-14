import { PackageCheck } from "lucide-react";
import { formatDateEs, formatMXN } from "@/lib/format";

export function BookingConfirmation({
  scheduledDate,
  totalCents,
  hasUnpriced,
}: {
  scheduledDate: string;
  totalCents: number;
  hasUnpriced: boolean;
}) {
  return (
    <div className="card rounded-2xl p-10 text-center">
      <PackageCheck className="w-10 h-10 text-accent mx-auto mb-4" />
      <h2 className="font-display font-bold uppercase text-3xl mb-2">¡Recolecta agendada!</h2>
      <p className="text-bone-mute">
        Programamos tu recolecta para el <span className="text-bone">{formatDateEs(scheduledDate)}</span>.
        Te contactaremos por WhatsApp para confirmar el horario en que pasaremos por tus piezas.
      </p>
      {totalCents > 0 && (
        <div className="mt-6 pt-6 border-t border-bone-border/[0.16]">
          <p className="eyebrow">Total estimado</p>
          <p className="font-display font-bold text-4xl text-accent mt-1">{formatMXN(totalCents)}</p>
          <p className="text-xs text-bone-mute mt-2">
            Se cobra contra entrega.
            {hasUnpriced && " Algunas piezas se cotizan directo, no están incluidas en este total."}
          </p>
        </div>
      )}
    </div>
  );
}
