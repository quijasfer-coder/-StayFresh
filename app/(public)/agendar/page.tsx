import { BookingForm } from "./booking-form";
import { SectionTitle } from "@/components/ui/section-title";
import { PageBackground } from "@/components/ui/page-background";
import { createPublicClient } from "@/lib/supabase/server";
import { listActivePriceTiers } from "@/lib/queries/pricing";

export const metadata = { title: "Agendar recolecta" };

export default async function AgendarPage() {
  const supabase = createPublicClient();
  const priceTiers = await listActivePriceTiers(supabase);

  return (
    <section className="container py-16 max-w-2xl">
      <PageBackground />
      <SectionTitle eyebrow="Agenda tu recolecta" title="Vamos por tus tenis." className="mb-10" />
      <BookingForm priceTiers={priceTiers} />
    </section>
  );
}
