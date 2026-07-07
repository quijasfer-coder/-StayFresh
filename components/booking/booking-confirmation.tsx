import { PackageCheck } from "lucide-react";

export function BookingConfirmation({ scheduledDate }: { scheduledDate: string }) {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <PackageCheck className="w-10 h-10 text-accent mx-auto mb-4" />
      <h2 className="font-display text-3xl mb-2">¡Recolecta agendada!</h2>
      <p className="text-bone-mute">
        Te esperamos el{" "}
        <span className="text-bone">
          {new Date(`${scheduledDate}T12:00:00`).toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
        . Te avisaremos por WhatsApp en cuanto tengamos novedades de tus piezas.
      </p>
    </div>
  );
}
