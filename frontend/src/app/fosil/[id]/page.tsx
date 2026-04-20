import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMapFossilById } from "@/data/mapFossils";
import {
  fetchFosilPublicById,
  fetchMultimediaFosilPublic,
  multimediaAbsUrl,
} from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const api = await fetchFosilPublicById(id);
  if (api) {
    return {
      title: api.nombre,
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
    const galeria = media.filter(
      (m) => m.tipo === "imagen" || m.tipo === "video",
    );

    const lat = api.latitud != null ? Number(api.latitud) : NaN;
    const lng = api.longitud != null ? Number(api.longitud) : NaN;
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    return (
      <div
        className="sw-page fosil-ficha-page"
        style={{ background: "var(--ink)" }}
      >
        <article
          className="fosil-ficha-inner"
          style={{
            maxWidth: "40rem",
            margin: "0 auto",
            padding: "6rem clamp(1.25rem, 4vw, 2rem) 4rem",
          }}
        >
          <span className="sec-eyebrow">Ficha · FosilesDB</span>
          <h1 className="sec-h" style={{ marginTop: "0.75rem" }}>
            {api.nombre}
          </h1>
          <div className="sec-rule" />
          {api.portada_url ? (
            <div
              style={{
                marginTop: "1.25rem",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                maxHeight: "min(52vh, 22rem)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={multimediaAbsUrl(api.portada_url)}
                alt={`Portada · ${api.nombre}`}
                className="block h-full w-full object-cover"
                style={{ maxHeight: "min(52vh, 22rem)" }}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          ) : null}
          {hasCoords ? (
            <p className="sec-body" style={{ marginTop: "1.5rem" }}>
              <strong>Coordenadas:</strong> {lat.toFixed(4)}, {lng.toFixed(4)}
            </p>
          ) : (
            <p className="sec-body" style={{ marginTop: "1.5rem", opacity: 0.85 }}>
              Ubicación sin coordenadas en el registro.
            </p>
          )}
          <p className="sec-body" style={{ marginTop: "1rem" }}>
            {api.descripcion_general}
          </p>
          {galeria.length > 0 ? (
            <div
              style={{
                marginTop: "1.75rem",
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              }}
            >
              {galeria.map((m) => (
                <figure
                  key={m.id}
                  style={{
                    margin: 0,
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "var(--surface)",
                  }}
                >
                  {m.tipo === "video" ? (
                    <video
                      src={multimediaAbsUrl(m.url)}
                      className="w-full bg-black object-contain"
                      style={{ maxHeight: "200px" }}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={multimediaAbsUrl(m.url)}
                      alt={m.descripcion || m.nombre_archivo || api.nombre}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <figcaption
                    className="sec-body"
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.35rem 0.5rem",
                      opacity: 0.85,
                    }}
                  >
                    {m.subtipo}
                    {m.descripcion ? ` · ${m.descripcion}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
          <p className="fosil-ficha-actions">
            <Link
              href="/mapa"
              className="btn-fill"
              style={{ display: "inline-block" }}
            >
              Volver al mapa
            </Link>
            <Link
              href="/catalogo"
              className="btn-out"
              style={{ display: "inline-block" }}
            >
              Ver catálogo
            </Link>
          </p>
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
        <p className="sec-body" style={{ marginTop: "1.5rem" }}>
          <strong>Coordenadas (demo):</strong>{" "}
          {f.latitud.toFixed(4)}, {f.longitud.toFixed(4)}
        </p>
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
