import type { Metadata } from "next";
import { GalleryCard } from "@/components/GalleryCard";
import { mockFossils } from "@/data/mockFossils";

export const metadata: Metadata = {
  title: "Catálogo",
};

export default function CatalogoPage() {
  return (
    <div className="sw-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "2rem" }}>
        <span className="sec-eyebrow">Colección</span>
        <h1 className="sec-h">Catálogo <em>visual</em></h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ margin: "1.6rem auto 0" }}>
          Piezas de demostración. Sin búsqueda ni filtros — solo presentación.
        </p>
      </section>

      <div
        className="gallery-grid"
        style={{ padding: "0 4rem 6rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        {mockFossils.map((fossil, i) => (
          <GalleryCard
            key={fossil.id}
            name={fossil.name}
            category={fossil.category}
            imageSrc={fossil.image}
            description={fossil.description}
            variant="default"
            delayMs={i * 50}
          />
        ))}
      </div>
    </div>
  );
}
