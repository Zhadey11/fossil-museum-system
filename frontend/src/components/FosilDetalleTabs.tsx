"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import {
  fetchEstudiosPorFosil,
  fetchFosilDetalleCompleto,
  multimediaAbsUrl,
  type EstudioFosilRow,
  type MultimediaRow,
} from "@/lib/api";

type Props = {
  fosilId: number;
  media: MultimediaRow[];
};

type TabId = "galeria" | "taxonomia" | "contexto" | "cientifico";

const SUBTIPO_LABEL: Record<string, string> = {
  portada: "Vista principal",
  general: "Fotografía",
  antes: "Antes",
  despues: "Después",
  analisis: "Análisis",
  escaneo: "Escaneo",
  reconstruccion: "Reconstrucción",
};

function val(v: unknown): string {
  if (v == null || String(v).trim() === "") return "—";
  return String(v);
}

export function FosilDetalleTabs({ fosilId, media }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("galeria");
  const [detalle, setDetalle] = useState<Record<string, unknown> | null>(null);
  const [estudios, setEstudios] = useState<EstudioFosilRow[] | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number | null>(null);
  const roles = getStoredUser()?.roles || [];
  const canSeeScientific = roles.includes(1) || roles.includes(2);
  const images = useMemo(() => {
    const subOrder: Record<string, number> = {
      antes: 0,
      portada: 1,
      despues: 2,
      general: 3,
      analisis: 4,
      escaneo: 5,
      reconstruccion: 6,
    };
    return media
      .filter((m) => m.tipo === "imagen")
      .slice()
      .sort(
        (a, b) =>
          (subOrder[a.subtipo || ""] ?? 99) - (subOrder[b.subtipo || ""] ?? 99) || (a.orden ?? 0) - (b.orden ?? 0),
      );
  }, [media]);

  useEffect(() => {
    if (!canSeeScientific) {
      setDetalle(null);
      setEstudios(null);
      return;
    }
    let mounted = true;
    fetchFosilDetalleCompleto(fosilId)
      .then((d) => mounted && setDetalle(d))
      .catch(() => mounted && setDetalle(null));
    fetchEstudiosPorFosil(fosilId)
      .then((rows) => mounted && setEstudios(rows))
      .catch(() => mounted && setEstudios([]));
    return () => {
      mounted = false;
    };
  }, [canSeeScientific, fosilId]);

  return (
    <section className="fossil-tabs-wrap">
      <div className="fossil-tabs-head">
        {[
          ["galeria", "Galería"],
          ...(canSeeScientific
            ? ([
                ["taxonomia", "Taxonomía"],
                ["contexto", "Contexto geológico"],
                ["cientifico", "Datos científicos"],
              ] as const)
            : []),
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`fossil-tab-btn ${activeTab === id ? "active" : ""}`.trim()}
            onClick={() => setActiveTab(id as TabId)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "galeria" ? (
        <div className="fossil-tab-panel">
          <div className="fossil-thumb-grid">
            {images.slice(0, 6).map((m, i) => (
              <article key={m.id} className="fossil-thumb-card">
                <button
                  type="button"
                  style={{ display: "block", width: "100%", textAlign: "left", cursor: "zoom-in" }}
                  onClick={() => setActiveImageIdx(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={multimediaAbsUrl(m.url)}
                    alt={m.descripcion || m.nombre_archivo || "Imagen del fósil"}
                    className="fossil-thumb-img"
                    loading="lazy"
                  />
                </button>
                <span className="fossil-thumb-label">
                  {SUBTIPO_LABEL[m.subtipo || "general"] || "Fotografía"}
                </span>
              </article>
            ))}
          </div>
          {activeImageIdx != null && images[activeImageIdx] ? (
            <div
              role="dialog"
              aria-modal="true"
              onClick={() => setActiveImageIdx(null)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 190,
                background: "rgba(5,8,12,.86)",
                display: "grid",
                placeItems: "center",
                padding: "1rem",
              }}
            >
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setActiveImageIdx(null)}
                style={{
                  position: "fixed",
                  top: 16,
                  right: 16,
                  width: 40,
                  height: 40,
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,.2)",
                  color: "white",
                  background: "rgba(0,0,0,.35)",
                  fontSize: "1.6rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={multimediaAbsUrl(images[activeImageIdx].url)}
                alt={
                  images[activeImageIdx].descripcion ||
                  images[activeImageIdx].nombre_archivo ||
                  "Imagen del fósil"
                }
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: "92vw",
                  maxHeight: "82vh",
                  objectFit: "contain",
                  borderRadius: 10,
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "taxonomia" ? (
        <div className="fossil-tab-panel">
          {canSeeScientific && detalle ? (
            <table className="fossil-taxo-table">
              <tbody>
                {[
                  ["Reino", val(detalle.reino)],
                  ["Filo", val(detalle.filo)],
                  ["Clase", val(detalle.clase)],
                  ["Orden", val(detalle.orden)],
                  ["Familia", val(detalle.familia)],
                  ["Género", val(detalle.genero)],
                  ["Especie", val(detalle.especie)],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <th>{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sec-body">Taxonomía disponible para perfiles de investigación.</p>
          )}
        </div>
      ) : null}

      {activeTab === "contexto" ? (
        <div className="fossil-tab-panel">
          <div className="fossil-context-grid">
            <div><strong>Contexto geológico:</strong> {val(detalle?.contexto_geologico)}</div>
            <div><strong>Formación / yacimiento:</strong> {val(detalle?.cantera_sitio)}</div>
            <div><strong>Zona UTM:</strong> {val(detalle?.zona_utm)}</div>
            <div><strong>Abrasión:</strong> {val(detalle?.abrasion)}</div>
            <div><strong>Fractura:</strong> {val(detalle?.fractura)}</div>
            <div><strong>Completitud:</strong> {val(detalle?.completitud)}</div>
          </div>
        </div>
      ) : null}

      {activeTab === "cientifico" ? (
        <div className="fossil-tab-panel">
          {canSeeScientific ? (
            <div className="fossil-science-panel">
              <p><strong>Código único:</strong> {val(detalle?.codigo_unico)}</p>
              <p><strong>Coordenadas GPS:</strong> {val(detalle?.latitud)}, {val(detalle?.longitud)}</p>
              <p><strong>Medidas (cm):</strong>{" "}
                {val(detalle?.largo_cm)} × {val(detalle?.ancho_cm)} × {val(detalle?.grosor_cm)}</p>
              <p><strong>Endurecedor:</strong> {val(detalle?.endurecedor)}</p>
              <p><strong>Meteorización:</strong> {val(detalle?.meteorizacion)}</p>
              <p><strong>Análisis registrados:</strong> {estudios == null ? "Cargando..." : estudios.length}</p>
              <p><strong>Investigador responsable:</strong> {val(detalle?.investigador_responsable)}</p>
              {estudios && estudios.length > 0 ? (
                <div style={{ marginTop: "0.75rem" }}>
                  <strong>Referencias y enlaces:</strong>
                  <ul style={{ marginTop: "0.4rem", paddingLeft: "1.1rem", display: "grid", gap: "0.3rem" }}>
                    {estudios.flatMap((e) => (Array.isArray(e.referencias) ? e.referencias : [])).length > 0 ? (
                      estudios
                        .flatMap((e) => (Array.isArray(e.referencias) ? e.referencias : []))
                        .map((ref) => (
                          <li key={`${ref.id}-${ref.url}`}>
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--amberhot)", textDecoration: "underline" }}
                            >
                              {ref.titulo || ref.url}
                            </a>
                          </li>
                        ))
                    ) : (
                      <li>Sin referencias registradas en los estudios actuales.</li>
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
