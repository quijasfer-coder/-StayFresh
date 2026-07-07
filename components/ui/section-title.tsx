import { cn } from "@/lib/utils";

/**
 * Patrón repetido en todo el sitio (referencia: template Ravox) — eyebrow
 * en acento + línea + punto decorativo, seguido de un heading grande
 * uppercase en la fuente display condensada.
 */
export function SectionTitle({
  eyebrow,
  title,
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-accent font-semibold uppercase tracking-[0.03em] text-sm sm:text-base">
          {eyebrow}
        </span>
        <span className="h-0.5 w-12 sm:w-24 bg-accent" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
      </div>
      <h2
        className={cn(
          "font-display font-bold uppercase leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
    </div>
  );
}
