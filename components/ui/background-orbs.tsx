/**
 * Blobs de luz difuminados de fondo — el ingrediente que hace que
 * `.glass` (backdrop-blur) realmente se note, en vez de verse como un
 * panel gris plano sobre negro liso. Montado una sola vez en el layout
 * raíz, fixed detrás de todo el contenido.
 */
export function BackgroundOrbs() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-accent/25 blur-[130px]" />
      <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-bone/[0.07] blur-[150px]" />
      <div className="absolute bottom-[-10%] left-1/3 w-[480px] h-[480px] rounded-full bg-accent-deep/20 blur-[140px]" />
    </div>
  );
}
