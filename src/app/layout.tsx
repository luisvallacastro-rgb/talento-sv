import type { Metadata } from "next";
import "./globals.css";
import "./portal.css";
import "./portal-extra.css";
import "./modern-home.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "Talento SV · Reclutamiento empresarial", template: "%s · Talento SV" },
  description: "Reclutamiento, evaluaciones psicométricas y selección por competencias en El Salvador.",
  openGraph: { title: "Talento SV", description: "Decisiones de contratación con más claridad.", images: [{ url: "/og.png", width: 1200, height: 630 }], locale: "es_SV", type: "website" },
  twitter: { card: "summary_large_image", title: "Talento SV", description: "Decisiones de contratación con más claridad.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
