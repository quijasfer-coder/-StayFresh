"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Botón chico para copiar un texto (ej. dirección) al portapapeles — para pegarlo directo en Maps/Waze. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API no disponible (ej. http sin TLS) — no bloquear la UI
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar dirección"
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-bone-mute hover:text-accent hover:bg-ink transition-colors shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
