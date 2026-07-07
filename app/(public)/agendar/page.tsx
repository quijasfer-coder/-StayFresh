import { BookingForm } from "./booking-form";

export const metadata = { title: "Agendar recolecta" };

export default function AgendarPage() {
  return (
    <section className="container py-16 max-w-2xl">
      <span className="eyebrow">Agenda tu recolecta</span>
      <h1 className="font-display text-4xl md:text-5xl mt-3 mb-10">
        Vamos por tus tenis.
      </h1>
      <BookingForm />
    </section>
  );
}
