import type { Metadata } from "next";
import { teko, kanit, mono } from "./fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stay Fresh",
    template: "%s · Stay Fresh",
  },
  description:
    "Lavado profesional de sneakers a domicilio en CDMX. Recolectamos, limpiamos y entregamos — botas, gorras y bolsas también. Pago contra entrega, garantía de satisfacción.",
  openGraph: {
    title: "Stay Fresh",
    description: "Tratamos tus tenis como lo que son.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={cn(teko.variable, kanit.variable, mono.variable, "dark")}
    >
      <body className="bg-ink text-bone font-body min-h-screen">
        {children}
      </body>
    </html>
  );
}
