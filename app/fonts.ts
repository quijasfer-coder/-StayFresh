import { Sora, Inter, JetBrains_Mono } from "next/font/google";

// Display — geométrica y limpia, para el look glassmorphism/minimalista
// tipo Apple (paneles de vidrio, capas translúcidas). Reemplaza a Anton
// (bold streetwear condensada) que no encajaba con esta dirección visual.
export const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
