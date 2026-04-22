import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMapFossilById } from "@/data/mapFossils";
import {
  fetchFosilPublicById,
  fetchMultimediaFosilPublic,
  multimediaAbsUrl,
} from "@/lib/api";
import { FosilDetalleTabs } from "@/components/FosilDetalleTabs";
import { tituloPublicoFosil } from "@/lib/fosilesDisplay";

type Props = { params: Promise<{ id: string }> };
function formatDate(dateLike?: string | null): string {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const api = await fetchFosilPublicById(id);
  if (api) {
    return {
      title: tituloPublicoFosil(api),
      description: api.descripcion_general?.slice(0, 160),
    };
  }
  const f = getMapFossilById(id);
  if (!f) return { title: "Ficha" };
  return {
    title: f.nombre,
    description: f.resumen,
  };
}

export default async function FosilFichaPage({ params }: Props) {
  const { id } = await params;
  const api = await fetchFosilPublicById(id);

  if (api) {
    const media = await fetchMultimediaFosilPublic(api.id);
    const descubridor =
      api.explorador_publico?.trim() ||
      [api.explorador_nombre, api.explorador_apellido]
        .filter((x) => typeof x === "string" && x.trim().length > 0)
        .join(" ");
    const titulo = tituloPublicoFosil(api);

    return (
      <div
        className="sw-page fosil-ficha-page"
        style={{ background: "var(--ink)" }}
      >
        <article
          className="fosil-detail-wrap"
          style={{
            maxWidth: "76rem",
            margin: "0 auto",
            padding: "4.8rem clamp(1.25rem, 4vw, 2rem) 3rem",
            display: "grid",
            gap: "1.25rem",
          }}
        >
          <Link href="/catalogo" className="catalog-back-link">&lt; Volver a la colección</Link>
          <section className="fossil-hero-grid">
            <div className="fossil-main-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={api.portada_url ? multimediaAbsUrl(api.portada_url) : "/catalogo-imagenes/amonita.svg"}
                alt={`Portada · ${titulo}`}
                className="fossil-main-image"
                loading="eager"
                fetchPriority="high"
              />
              <div className="fossil-main-overlay">
                <h1>{titulo}</h1>
                <div className="fossil-main-badges">
                  <span>{api.categoria_nombre || "Categoría"}</span>
                  <span>{api.era_nombre || "Era"}</span>
                </div>
              </div>
            </div>
            <aside className="fossil-info-panel">
              <h2>Resumen</h2>
              <p>{api.descripcion_general || "Sin descripción disponible."}</p>
              <p><strong>Ubicación:</strong> {api.ubicacion || api.descripcion_ubicacion || api.pais || "No disponible"}</p>
              {api.cantera_sitio ? (
                <p><strong>Formación / yacimiento:</strong> {api.cantera_sitio}</p>
              ) : null}
              <p><strong>Fecha de hallazgo:</strong> {formatDate(api.fecha_hallazgo)}</p>
              <p><strong>Encontrado por:</strong> {descubridor || "No disponible"}</p>
            </aside>
          </section>

          <FosilDetalleTabs
            fosilId={api.id}
            media={media}
          />
        </article>
      </div>
    );
  }

  const f = getMapFossilById(id);
  if (!f) notFound();

  return (
    <div className="sw-page fosil-ficha-page" style={{ background: "var(--ink)" }}>
      <article
        className="fosil-ficha-inner"
        style={{
          maxWidth: "40rem",
          margin: "0 auto",
          padding: "6rem clamp(1.25rem, 4vw, 2rem) 4rem",
        }}
      >
        <span className="sec-eyebrow">
          {f.pais} · {f.provincia}
        </span>
        <h1 className="sec-h" style={{ marginTop: "0.75rem" }}>
          {f.nombre}
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ marginTop: "1rem" }}>
          {f.descripcion}
        </p>
        <p className="fosil-ficha-actions">
          <Link href="/mapa" className="btn-fill" style={{ display: "inline-block" }}>
            Volver al mapa
          </Link>
          <Link href="/catalogo" className="btn-out" style={{ display: "inline-block" }}>
            Ver catálogo
          </Link>
        </p>
      </article>
    </div>
  );
}
