import { Kanit, Teko, JetBrains_Mono } from "next/font/google";

// Display — condensada y alta, para headlines de impacto (estilo template
// Ravox: números/uppercase gigantes). Reemplaza a Sora.
export const teko = Teko({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body/UI — geométrica, usada también en nav, botones y labels uppercase.
export const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
