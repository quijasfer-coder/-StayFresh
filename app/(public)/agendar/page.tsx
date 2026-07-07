import { BookingForm } from "./booking-form";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata = { title: "Agendar recolecta" };

export default function AgendarPage() {
  return (
    <section className="container py-16 max-w-2xl">
      <SectionTitle eyebrow="Agenda tu recolecta" title="Vamos por tus tenis." className="mb-10" />
      <BookingForm />
    </section>
  );
}
