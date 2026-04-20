import type { Metadata } from "next";
import { Cormorant, Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteFooter } from "@/components/SiteFooter";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

/** Texto UI, nav, botones, párrafos (.sec-body, .hero-sub): Source Sans 3 */
const sourceSans = Source_Sans_3({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

/** Títulos de sección .sec-h, hero em, timeline .tl-name: Cormorant */
const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

/** Marca “StoneWake”, números destacados, citas: Cormorant Garamond */
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

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
      <body
        className={`${sourceSans.variable} ${cormorant.variable} ${cormorantGaramond.variable} antialiased`}
        suppressHydrationWarning
      >
        <CustomCursor />
        <TopNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
