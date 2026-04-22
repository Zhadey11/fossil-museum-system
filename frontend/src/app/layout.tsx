import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

/**
 * Fuentes: Google Fonts por <link> (evita bug de Turbopack con next/font/google
 * “Can't resolve @vercel/turbopack-next/internal/font/google/font”).
 * Familias definidas en globals.css :root → --font-ui, --font-cormorant, --font-cormorant-garamond.
 */
const googleFontsHref =
  "https://fonts.googleapis.com/css2?" +
  "family=Cormorant:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&" +
  "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&" +
  "family=Source+Sans+3:wght@300;400;500;600&" +
  "display=swap";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Stonewake Museum — Fossil Collection",
    template: "%s — Stonewake Museum",
  },
  description:
    "Colección fósil y museo Stonewake: exploración visual del tiempo profundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsHref} rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <TopNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
