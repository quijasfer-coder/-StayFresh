import { PackageCheck } from "lucide-react";
import { formatDateEs } from "@/lib/format";

export function BookingConfirmation({ scheduledDate }: { scheduledDate: string }) {
  return (
    <div className="card rounded-2xl p-10 text-center">
      <PackageCheck className="w-10 h-10 text-accent mx-auto mb-4" />
      <h2 className="font-display font-bold uppercase text-3xl mb-2">¡Recolecta agendada!</h2>
      <p className="text-bone-mute">
        Te esperamos el <span className="text-bone">{formatDateEs(scheduledDate)}</span>. Te
        avisaremos por WhatsApp en cuanto tengamos novedades de tus piezas.
      </p>
    </div>
  );
}
