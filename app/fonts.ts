import { Poppins, JetBrains_Mono } from "next/font/google";

// Geométrica y redondeada — el alternativa libre más cercana a Gilroy
// (misma construcción circular en la "o"/"a", terminaciones suaves).
// Se usa la misma familia para display y body, solo cambian los pesos.
export const poppinsDisplay = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const poppinsBody = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
