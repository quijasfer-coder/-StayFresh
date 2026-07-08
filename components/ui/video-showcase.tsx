"use client";

import { useEffect, useRef } from "react";

/**
 * El atributo autoPlay de React no siempre basta en Safari/iOS — el
 * navegador exige que `muted` esté aplicado como propiedad del elemento
 * (no solo el atributo) antes de permitir el autoplay. Por eso se fuerza
 * `.muted = true` + `.play()` a mano, y se usa un IntersectionObserver
 * para reintentar cuando el video entra en viewport (algunos móviles solo
 * autorizan el autoplay una vez visible).
 */
export function VideoShowcase({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {
        /* el navegador sigue bloqueando el autoplay — se reintenta al entrar en viewport */
      });
    };

    tryPlay();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className="w-full h-auto fade-edges"
    />
  );
}
