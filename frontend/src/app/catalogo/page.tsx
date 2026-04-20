import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  PERIODO_ID_BY_SLUG,
  TIMELINE_BLOCKS,
} from "@/data/timeline";
import { fetchCatalogoPublicoImagenes } from "@/lib/api";
import { catalogImageCardFromApi } from "@/lib/fosilesDisplay";

type PageProps = {
  searchParams: Promise<{
    periodo_id?: string | string[];
    periodo?: string | string[];
    era?: string | string[];
    categoria?: string | string[];
    q?: string | string[];
    ubicacion?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

function asText(v: string | string[] | undefined): string {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    const first = v.find((x) => typeof x === "string" && x.trim().length > 0);
    return first ? first.trim() : "";
  }
  return "";
}

const ERA_OPTIONS = [
  { id: "1", label: "Hadeico" },
  { id: "2", label: "Arcaico" },
  { id: "3", label: "Proterozoico" },
  { id: "4", label: "Paleozoico" },
  { id: "5", label: "Mesozoico" },
  { id: "6", label: "Cenozoico" },
];

const PERIOD_OPTIONS = TIMELINE_BLOCKS.map((b) => ({
  id: String(PERIODO_ID_BY_SLUG[b.slug]),
  label: b.title,
}));

export const metadata: Metadata = {
  title: "Colección de Fósiles",
  description: "Colección pública de fósiles catalogados por era, período y categoría.",
};

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = asText(params.q);
  const ubicacion = asText(params.ubicacion);
  const categoria = asText(params.categoria);
  const era = asText(params.era);
  const periodoSlug = asText(params.periodo);
  const periodoIdRaw = asText(params.periodo_id);
  const periodoId =
    periodoIdRaw ||
    (periodoSlug
      ? String(PERIODO_ID_BY_SLUG[periodoSlug as keyof typeof PERIODO_ID_BY_SLUG] || "")
      : "");
  const sort = asText(params.sort) || "default";
  const page = Math.max(1, Number(asText(params.page) || "1") || 1);
  const categoriaId = categoria ? Number(categoria) : undefined;

  const apiResult = await fetchCatalogoPublicoImagenes({
    ...(periodoId ? { periodo_id: Number(periodoId) } : {}),
    ...(era ? { era_id: Number(era) } : {}),
    ...(q ? { q } : {}),
    ...(ubicacion ? { ubicacion } : {}),
    ...(Number.isFinite(categoriaId) ? { categoria_id: categoriaId } : {}),
    page,
    page_size: 24,
    include_total: page === 1,
  });

  const mapped =
    apiResult.ok && apiResult.data.length > 0
      ? apiResult.data.map((row, i) => catalogImageCardFromApi(row, i))
      : [];

  const fossils =
    sort === "name_asc"
      ? [...mapped].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
      : [...mapped];

  const hasPrevPage = page > 1;
  const hasNextPage = apiResult.ok ? apiResult.has_next : false;
  const totalItems = apiResult.ok ? apiResult.total : fossils.length;
  const hasPreciseTotal = apiResult.ok && Number.isFinite(apiResult.total) && apiResult.total > 0;

  return (
    <div className="sw-page catalog-page-modern" style={{ background: "var(--surface)" }}>
      <section className="catalog-hero-modern">
        {!apiResult.ok ? (
          <p className="sec-body" style={{ margin: "0 auto 1rem", textAlign: "center", opacity: 0.85 }}>
            No pudimos cargar la colección completa en este momento.
          </p>
        ) : null}
        <span className="sec-eyebrow">Colección pública</span>
        <h1 className="sec-h">Colección de Fósiles</h1>
        <p className="sec-body catalog-hero-sub">
          Explorá fósiles por categoría, era geológica, período y ubicación. Usá la búsqueda para encontrar piezas por nombre.
        </p>
        <form method="get" className="catalog-search-wrap">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, era, ubicación o categoría"
            className="catalog-search-input"
          />
          <input type="hidden" name="ubicacion" value={ubicacion} />
          <input type="hidden" name="categoria" value={categoria} />
          <input type="hidden" name="era" value={era} />
          <input type="hidden" name="periodo_id" value={periodoId} />
          <input type="hidden" name="sort" value={sort} />
          <button type="submit" className="btn-fill">Buscar</button>
        </form>
      </section>

      <section className="catalog-controls">
        <div className="catalog-pill-row">
          {[
            { id: "", label: "Todas" },
            { id: "4", label: "PAL" },
            { id: "2", label: "MIN" },
            { id: "1", label: "FOS" },
            { id: "3", label: "ROC" },
          ].map((c) => (
            <Link
              key={c.id || "all"}
              href={{
                pathname: "/catalogo",
                query: {
                  ...(periodoId ? { periodo_id: periodoId } : {}),
                  ...(q ? { q } : {}),
                  ...(ubicacion ? { ubicacion } : {}),
                  ...(era ? { era } : {}),
                  ...(sort ? { sort } : {}),
                  ...(c.id ? { categoria: c.id } : {}),
                  page: "1",
                },
              }}
              className={`catalog-pill ${categoria === c.id ? "active" : ""}`.trim()}
            >
              {c.label}
            </Link>
          ))}
        </div>
        <div className="catalog-filter-row">
          <form method="get" className="catalog-filter-form">
            <input type="hidden" name="q" value={q} />
            <input type="hidden" name="categoria" value={categoria} />
            <input type="hidden" name="ubicacion" value={ubicacion} />
            <select name="era" defaultValue={era} className="catalog-select">
              <option value="">Todas las eras</option>
              {ERA_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select name="periodo_id" defaultValue={periodoId} className="catalog-select">
              <option value="">Todos los períodos</option>
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={sort} className="catalog-select">
              <option value="default">Orden predeterminado</option>
              <option value="name_asc">Nombre (A-Z)</option>
            </select>
            <button type="submit" className="btn-out">Aplicar</button>
          </form>
          <p className="catalog-count">
            {hasPreciseTotal ? `${totalItems} fósiles encontrados` : `Mostrando ${fossils.length} fósiles`}
          </p>
        </div>
      </section>

      <section className="catalog-cards-grid">
        {fossils.length === 0 ? (
          <p className="sec-body" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            No hay resultados para mostrar.
          </p>
        ) : (
          fossils.map((fossil) => (
            <article key={fossil.id} className="catalog-fossil-card">
              <div className="catalog-thumb-wrap">
                <Image
                  src={fossil.imageSrc}
                  alt={fossil.name}
                  className="catalog-thumb"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <span className={`catalog-cat-badge ${fossil.categoryBadge}`.trim()}>
                  {fossil.categoryBadge}
                </span>
                <span className="catalog-era-badge">{fossil.eraLabel}</span>
              </div>
              <div className="catalog-card-body">
                <h3 className="catalog-card-title">{fossil.name}</h3>
                <p className="catalog-card-desc">{fossil.description}</p>
                <p className="catalog-origin">{fossil.originLabel}</p>
              </div>
              <footer className="catalog-card-footer">
                <span className="catalog-location">{fossil.category}</span>
                <Link href={fossil.fichaHref || "/catalogo"} className="catalog-detail-link">
                  Ver detalle
                </Link>
              </footer>
            </article>
          ))
        )}
      </section>
      {apiResult.ok ? (
        <div className="catalog-pagination">
          {hasPrevPage ? (
            <Link
              href={{
                pathname: "/catalogo",
                query: {
                  ...(periodoId ? { periodo_id: periodoId } : {}),
                  ...(era ? { era } : {}),
                  ...(q ? { q } : {}),
                  ...(ubicacion ? { ubicacion } : {}),
                  ...(categoria ? { categoria } : {}),
                  ...(sort ? { sort } : {}),
                  page: String(Math.max(1, page - 1)),
                },
              }}
              className="catalog-page-link"
            >
              Anterior
            </Link>
          ) : null}
          <span className="catalog-page-label">
            {hasPreciseTotal
              ? `Página ${page} de ${Math.max(1, Math.ceil(totalItems / apiResult.page_size))}`
              : `Página ${page}`}
          </span>
          <Link
            href={{
              pathname: "/catalogo",
              query: {
                ...(periodoId ? { periodo_id: periodoId } : {}),
                ...(era ? { era } : {}),
                ...(q ? { q } : {}),
                ...(ubicacion ? { ubicacion } : {}),
                ...(categoria ? { categoria } : {}),
                ...(sort ? { sort } : {}),
                page: String(page + 1),
              },
            }}
            className={`catalog-page-link ${hasNextPage ? "" : "disabled"}`.trim()}
            aria-disabled={!hasNextPage}
            tabIndex={hasNextPage ? 0 : -1}
          >
            Siguiente
          </Link>
        </div>
      ) : null}
    </div>
  );
}
