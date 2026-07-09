import Image from "next/image";

/**
 * Fondo sutil de página completa — foto atenuada + velo oscuro fijo detrás
 * del contenido. Pensado para páginas de formulario/login donde la legibilidad
 * importa más que el impacto visual (a diferencia del hero de home).
 */
export function PageBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/images/page-background.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-black/70" />
    </div>
  );
}
