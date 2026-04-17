import type { Metadata } from "next";
import Link from "next/link";
import { GalleryCard } from "@/components/GalleryCard";
import { mockFossils } from "@/data/mockFossils";
import {
  isTimelineEraId,
  TIMELINE_ERA_CATALOG_INTRO,
} from "@/data/timeline";

type PageProps = {
  searchParams: Promise<{ era?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { era } = await searchParams;
  if (era && isTimelineEraId(era)) {
    const meta = TIMELINE_ERA_CATALOG_INTRO[era];
    return {
      title: `${meta.title} | Catálogo`,
      description: meta.body,
    };
  }
  return { title: "Catálogo" };
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawEra = params.era;
  const era = rawEra && isTimelineEraId(rawEra) ? rawEra : null;
  const unknownEra = Boolean(rawEra && !era);

  const fossils = era
    ? mockFossils.filter((f) => f.eraId === era)
    : mockFossils;

  const intro = era ? TIMELINE_ERA_CATALOG_INTRO[era] : null;

  return (
    <div className="sw-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "2rem" }}>
        {intro ? (
          <>
            <span className="sec-eyebrow">{intro.eyebrow}</span>
            <h1 className="sec-h">
              Catálogo <em>visual</em>
            </h1>
            <div className="sec-rule" />
            <p
              className="sec-body"
              style={{ margin: "1.6rem auto 0", maxWidth: "40rem" }}
            >
              {intro.body}
            </p>
            <p
              className="catalog-era-chip"
              style={{
                marginTop: "1.25rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <span className="catalog-era-pill">{intro.title}</span>
              <Link href="/catalogo" className="catalog-clear-filter">
                Ver toda la colección
              </Link>
            </p>
          </>
        ) : (
          <>
            <span className="sec-eyebrow">Colección</span>
            <h1 className="sec-h">
              Catálogo <em>visual</em>
            </h1>
            <div className="sec-rule" />
            <p className="sec-body" style={{ margin: "1.6rem auto 0" }}>
              Piezas de demostración. Usa la línea del tiempo en la página
              principal para filtrar por era; luego conectará con búsqueda real.
            </p>
          </>
        )}
        {unknownEra ? (
          <p
            className="sec-body"
            style={{
              margin: "1rem auto 0",
              maxWidth: "36rem",
              opacity: 0.9,
              textAlign: "center",
            }}
          >
            El valor <code className="catalog-code">{rawEra}</code> no es una era
            reconocida. Mostrando toda la colección.
          </p>
        ) : null}
      </section>

      <div
        className="gallery-grid"
        style={{
          padding: "0 4rem 6rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {fossils.length === 0 ? (
          <p
            className="sec-body"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              margin: "2rem auto",
            }}
          >
            No hay piezas de ejemplo para esta era.{" "}
            <Link href="/catalogo" className="catalog-clear-filter">
              Ver toda la colección
            </Link>
          </p>
        ) : (
          fossils.map((fossil, i) => (
            <GalleryCard
              key={fossil.id}
              name={fossil.name}
              category={fossil.category}
              imageSrc={fossil.image}
              description={fossil.description}
              variant="default"
              delayMs={i * 50}
            />
          ))
        )}
      </div>
    </div>
  );
}
