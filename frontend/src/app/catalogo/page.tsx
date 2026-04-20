import type { Metadata } from "next";
import Link from "next/link";
import { GalleryCard } from "@/components/GalleryCard";
import { mockFossils } from "@/data/mockFossils";
import {
  PERIODO_CATALOG_INTRO,
  PERIODO_ID_BY_SLUG,
  resolvePeriodoSlugFromParams,
  type PeriodoGeologicoSlug,
} from "@/data/timeline";
import { fetchFosilesPublic } from "@/lib/api";
import { fosilCardFromApi } from "@/lib/fosilesDisplay";

type PageProps = {
  searchParams: Promise<{
    periodo?: string;
    era?: string;
    q?: string;
    ubicacion?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const periodoSlug = resolvePeriodoSlugFromParams(params);
  if (periodoSlug) {
    const meta = PERIODO_CATALOG_INTRO[periodoSlug];
    return {
      title: `${meta.title} | Catálogo`,
      description: meta.body,
    };
  }
  return { title: "Catálogo" };
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const periodoSlug = resolvePeriodoSlugFromParams(params);
  const hasFilterParam = Boolean(params.periodo || params.era);
  const unknownParam = hasFilterParam && periodoSlug === null;
  const q = params.q?.trim() || "";
  const ubicacion = params.ubicacion?.trim() || "";
  const page = Math.max(1, Number(params.page || "1") || 1);

  const periodoId =
    periodoSlug != null
      ? PERIODO_ID_BY_SLUG[periodoSlug as PeriodoGeologicoSlug]
      : undefined;

  const apiResult = await fetchFosilesPublic({
    ...(periodoId != null ? { periodo_id: periodoId } : {}),
    ...(q ? { q } : {}),
    ...(ubicacion ? { ubicacion } : {}),
    page,
    page_size: 24,
  });

  const mockCards = periodoSlug
    ? mockFossils.filter((f) => f.periodoSlug === periodoSlug)
    : mockFossils;

  const fossils =
    apiResult.ok && apiResult.data.length > 0
      ? apiResult.data.map((row, i) => fosilCardFromApi(row, i))
      : !apiResult.ok
        ? mockCards.map((f) => ({
            id: f.id,
            name: f.name,
            category: f.category,
            imageSrc: f.image,
            description: f.description,
            fichaHref: `/fosil/${f.id}`,
          }))
        : [];

  const useApi = apiResult.ok && apiResult.data.length > 0;
  const apiEmptyOk = apiResult.ok && apiResult.data.length === 0;

  const intro = periodoSlug ? PERIODO_CATALOG_INTRO[periodoSlug] : null;

  return (
    <div className="sw-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "2rem" }}>
        {!apiResult.ok ? (
          <p
            className="sec-body"
            style={{
              margin: "0 auto 1rem",
              maxWidth: "40rem",
              textAlign: "center",
              opacity: 0.85,
            }}
          >
            No se pudo conectar al servidor ({apiResult.error || "error"}).
            Mostrando datos de demostración. Comprueba{" "}
            <code className="catalog-code">NEXT_PUBLIC_API_URL</code> y que el
            backend esté en marcha.
          </p>
        ) : null}
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
              {useApi
                ? "Datos desde la API (fósiles publicados). La línea del tiempo filtra por periodo geológico."
                : !apiResult.ok
                  ? "Mostrando demostración local porque no hay API."
                  : apiEmptyOk && periodoSlug
                    ? "No hay fósiles publicados para este periodo. Prueba otro periodo o quita el filtro."
                    : apiEmptyOk
                      ? "La API no devolvió fósiles publicados. Ejecuta database/04_datos_prueba.sql (incluye MULTIMEDIA y portadas) y comprueba que el backend sirva las carpetas en backend/images."
                      : null}
            </p>
          </>
        )}
        {unknownParam ? (
          <p
            className="sec-body"
            style={{
              margin: "1rem auto 0",
              maxWidth: "36rem",
              opacity: 0.9,
              textAlign: "center",
            }}
          >
            Parámetro de periodo no reconocido. Mostrando toda la colección.
          </p>
        ) : null}
        <form
          method="get"
          style={{
            margin: "1rem auto 0",
            maxWidth: "44rem",
            display: "grid",
            gap: "0.5rem",
            gridTemplateColumns: "2fr 2fr auto",
          }}
        >
          {periodoSlug ? <input type="hidden" name="periodo" value={periodoSlug} /> : null}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o código"
            className="rounded-sm border px-3 py-2"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          />
          <input
            name="ubicacion"
            defaultValue={ubicacion}
            placeholder="Ubicación (provincia, cantón...)"
            className="rounded-sm border px-3 py-2"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          />
          <button type="submit" className="btn-out">
            Buscar
          </button>
        </form>
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
              maxWidth: "36rem",
            }}
          >
            {periodoSlug ? (
              <>
                No hay piezas publicadas para este periodo.{" "}
                <Link href="/catalogo" className="catalog-clear-filter">
                  Ver toda la colección
                </Link>
              </>
            ) : apiEmptyOk ? (
              <>
                No hay fósiles publicados en la base de datos. Carga{" "}
                <code className="catalog-code">04_datos_prueba.sql</code> y
                copia las carpetas de{" "}
                <code className="catalog-code">backend/images/fossiles</code>{" "}
                para ver portadas y galería.
              </>
            ) : (
              "No hay resultados para mostrar."
            )}
          </p>
        ) : (
          fossils.map((fossil, i) => (
            <GalleryCard
              key={fossil.id}
              name={fossil.name}
              category={fossil.category}
              imageSrc={fossil.imageSrc}
              description={fossil.description}
              variant="default"
              delayMs={i * 50}
              fichaHref={fossil.fichaHref}
            />
          ))
        )}
      </div>
      {apiResult.ok ? (
        <p className="sec-body" style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Link
            href={{
              pathname: "/catalogo",
              query: {
                ...(periodoSlug ? { periodo: periodoSlug } : {}),
                ...(q ? { q } : {}),
                ...(ubicacion ? { ubicacion } : {}),
                page: String(Math.max(1, page - 1)),
              },
            }}
            className="catalog-clear-filter"
            style={{ marginRight: "1rem", pointerEvents: page <= 1 ? "none" : "auto", opacity: page <= 1 ? 0.5 : 1 }}
          >
            ← Anterior
          </Link>
          Página {page}
          <Link
            href={{
              pathname: "/catalogo",
              query: {
                ...(periodoSlug ? { periodo: periodoSlug } : {}),
                ...(q ? { q } : {}),
                ...(ubicacion ? { ubicacion } : {}),
                page: String(page + 1),
              },
            }}
            className="catalog-clear-filter"
            style={{ marginLeft: "1rem", pointerEvents: fossils.length < 24 ? "none" : "auto", opacity: fossils.length < 24 ? 0.5 : 1 }}
          >
            Siguiente →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
