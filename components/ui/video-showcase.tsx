"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Video con overlay de logo. El atributo autoPlay de React no siempre basta
 * en Safari/iOS — el navegador exige que `muted` esté aplicado como
 * propiedad del elemento (no solo el atributo) antes de decidir si permite
 * el autoplay. Por eso se fuerza `.muted = true` + `.play()` a mano, y se
 * usa un IntersectionObserver para reintentar cuando el video entra en
 * viewport (algunos móviles solo autorizan el autoplay una vez visible).
 */
export function VideoShowcase({ src, logoSrc }: { src: string; logoSrc: string }) {
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
    <div className="relative">
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
      <Image
        src={logoSrc}
        alt="Stay Fresh"
        width={1080}
        height={1350}
        className="absolute left-[6%] top-1/2 -translate-y-1/2 w-[26%] sm:w-[20%] h-auto pointer-events-none select-none"
      />
    </div>
  );
}
