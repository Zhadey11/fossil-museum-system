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
  contextoGeologico?: string | null;
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

export function FosilDetalleTabs({ fosilId, media, contextoGeologico }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("galeria");
  const [detalle, setDetalle] = useState<Record<string, unknown> | null>(null);
  const [estudios, setEstudios] = useState<EstudioFosilRow[] | null>(null);
  const roles = getStoredUser()?.roles || [];
  const canSeeScientific = roles.includes(1) || roles.includes(2);
  const images = useMemo(() => media.filter((m) => m.tipo === "imagen"), [media]);

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
          ["taxonomia", "Taxonomía"],
          ["contexto", "Contexto geológico"],
          ...(canSeeScientific ? ([["cientifico", "Datos científicos"]] as const) : []),
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`fossil-tab-btn ${activeTab === id ? "active" : ""}`.trim()}
            onClick={() => setActiveTab(id as TabId)}
          >
            {label}
            {id === "cientifico" ? " 🔒" : ""}
          </button>
        ))}
      </div>

      {activeTab === "galeria" ? (
        <div className="fossil-tab-panel">
          <div className="fossil-thumb-grid">
            {images.slice(0, 6).map((m) => (
              <article key={m.id} className="fossil-thumb-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={multimediaAbsUrl(m.url)}
                  alt={m.descripcion || m.nombre_archivo || "Imagen del fósil"}
                  className="fossil-thumb-img"
                  loading="lazy"
                />
                <span className="fossil-thumb-label">
                  {SUBTIPO_LABEL[m.subtipo || "general"] || "Fotografía"}
                </span>
              </article>
            ))}
          </div>
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
            <div><strong>Estratigrafía:</strong> {canSeeScientific && detalle ? val(detalle.zona_utm) : "—"}</div>
            <div><strong>Formación:</strong> {canSeeScientific && detalle ? val(detalle.cantera_sitio) : "—"}</div>
            <div><strong>Abrasión:</strong> {canSeeScientific && detalle ? val(detalle.abrasion) : "—"}</div>
            <div><strong>Fractura:</strong> {canSeeScientific && detalle ? val(detalle.fractura) : "—"}</div>
            <div><strong>Completitud:</strong> {canSeeScientific && detalle ? val(detalle.completitud) : "—"}</div>
            <div><strong>Contexto público:</strong> {val(contextoGeologico)}</div>
          </div>
        </div>
      ) : null}

      {activeTab === "cientifico" ? (
        <div className="fossil-tab-panel">
          {canSeeScientific ? (
            <div className="fossil-science-panel">
              <p><strong>Código único:</strong> {val(detalle?.codigo_unico)}</p>
              <p><strong>Coordenadas GPS:</strong> {val(detalle?.latitud)}, {val(detalle?.longitud)}</p>
              <p><strong>Análisis registrados:</strong> {estudios == null ? "Cargando..." : estudios.length}</p>
              <p><strong>Investigador responsable:</strong> {val(detalle?.investigador_responsable)}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
