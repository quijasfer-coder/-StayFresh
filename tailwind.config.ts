import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Core — superficie clara neumórfica (soft UI). "ink" = fondo/superficie,
        // "bone" = texto, mismos nombres que antes para no tener que renombrar
        // clases en toda la app — solo cambian los valores.
        ink: {
          DEFAULT: "#E2E4EA",   // fondo de página
          off: "#DCE2EA",       // tono hundido (zonas inset/sunken)
          surface: "#F2F5F9",   // tarjetas/inputs — un poco más claro que el fondo
        },
        bone: {
          DEFAULT: "#3D4557",   // texto principal (slate oscuro)
          mute: "#8791A6",      // texto secundario
          border: "#C7D0DC",    // divisores/bordes suaves
        },
        // Acento — naranja cálido (kit neumórfico de referencia), reemplaza
        // la lima anterior. Un solo color selectivo sobre la base gris clara.
        accent: {
          DEFAULT: "#FF8A42",
          deep: "#E06A1D",
          wash: "#FFE7D2",
        },
        // Superficie oscura reservada SOLO para veils/gradientes sobre fotos
        // (hero, tarjetas de catálogo) — el resto del sitio es claro.
        scrim: {
          DEFAULT: "#0E0E10",
        },
        // Functional
        danger: "#E5484D",
        success: "#2FAE60",
        warning: "#F2B705",

        // shadcn-compatible aliases (CSS variables driven)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        capsule: "9999px",
      },
      backgroundImage: {
        "spotlight":
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,138,66,0.16), rgba(0,0,0,0) 70%)",
        "grain":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
      },
      boxShadow: {
        // Sombra dual neumórfica — luz arriba-izquierda, sombra abajo-derecha.
        // Sobre fondo #E7EBF1: sombra fría (gris-azul) + luz cálida (blanco).
        neu: "8px 8px 18px rgba(163,177,198,0.55), -8px -8px 18px rgba(255,255,255,0.85)",
        "neu-sm": "4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.85)",
        "neu-lg": "12px 12px 28px rgba(163,177,198,0.55), -12px -12px 28px rgba(255,255,255,0.85)",
        "neu-inset": "inset 5px 5px 10px rgba(163,177,198,0.5), inset -5px -5px 10px rgba(255,255,255,0.8)",
        "neu-inset-sm": "inset 3px 3px 6px rgba(163,177,198,0.5), inset -3px -3px 6px rgba(255,255,255,0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out forwards",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
