"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelGuard } from "@/components/PanelGuard";
import {
  fetchEstudiosPorFosil,
  fetchFosilDetalleCompleto,
  type EstudioFosilRow,
} from "@/lib/api";
import { NEED_INVESTIGADOR } from "@/lib/panelNeeds";

function DetalleBody() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [estudios, setEstudios] = useState<EstudioFosilRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setErr(null);
    setData(null);
    setEstudios(null);
    fetchFosilDetalleCompleto(id)
      .then(setData)
      .catch((e) =>
        setErr(e instanceof Error ? e.message : "No se pudo cargar el detalle"),
      );
    fetchEstudiosPorFosil(id)
      .then(setEstudios)
      .catch(() => setEstudios([]));
  }, [id]);

  if (err) {
    return (
      <p className="sec-body" style={{ color: "salmon" }}>
        {err}
      </p>
    );
  }

  if (!data || estudios === null) {
    return <p className="sec-body">Cargando detalle científico…</p>;
  }

  const taxonomia = [
    ["Reino", data.reino],
    ["Filo", data.filo],
    ["Clase", data.clase],
    ["Orden", data.orden],
    ["Familia", data.familia],
    ["Género", data.genero],
    ["Especie", data.especie],
  ].filter((item): item is [string, unknown] => {
    const value = item[1];
    return value != null && String(value).trim().length > 0;
  });

  return (
    <div className="sec-body" style={{ fontSize: "0.92rem", display: "grid", gap: "1rem" }}>
      <section className="rounded-sm border p-3" style={{ borderColor: "var(--border)" }}>
        <h2 className="sec-h" style={{ fontSize: "1rem" }}>Ficha avanzada</h2>
        <p><strong>Código único:</strong> {String(data.codigo_unico || "—")}</p>
        <p><strong>Estado:</strong> {String(data.estado || "—")}</p>
        <p><strong>Ubicación exacta:</strong> {String(data.latitud || "—")}, {String(data.longitud || "—")}</p>
        <p><strong>Ubicación descriptiva:</strong> {String(data.descripcion_ubicacion || "—")}</p>
        <p><strong>Contexto geológico:</strong> {String(data.contexto_geologico || "—")}</p>
        <p><strong>Estado original:</strong> {String(data.descripcion_estado_orig || "—")}</p>
      </section>

      <section className="rounded-sm border p-3" style={{ borderColor: "var(--border)" }}>
        <h2 className="sec-h" style={{ fontSize: "1rem" }}>Clasificación taxonómica</h2>
        {taxonomia.length === 0 ? (
          <p>Sin taxonomía asociada.</p>
        ) : (
          taxonomia.map(([k, v]) => (
            <p key={k}>
              <strong>{k}:</strong> {String(v)}
            </p>
          ))
        )}
      </section>

      <section className="rounded-sm border p-3" style={{ borderColor: "var(--border)" }}>
        <h2 className="sec-h" style={{ fontSize: "1rem" }}>Estudios científicos</h2>
        {estudios.length === 0 ? (
          <p>No hay estudios científicos registrados para este fósil.</p>
        ) : (
          estudios.map((e) => (
            <article key={e.id} style={{ marginBottom: "0.8rem", paddingBottom: "0.8rem", borderBottom: "1px solid var(--border)" }}>
              <p><strong>{e.titulo}</strong></p>
              <p><strong>Contexto y objetivo:</strong> {e.contexto_objetivo}</p>
              <p><strong>Tipo de análisis:</strong> {e.tipo_analisis}</p>
              <p><strong>Resultados:</strong> {e.resultados}</p>
              <p><strong>Composición:</strong> {e.composicion || "—"}</p>
              <p><strong>Condiciones del hallazgo:</strong> {e.condiciones_hallazgo || "—"}</p>
              <p>
                <strong>Investigador:</strong>{" "}
                {[e.investigador_nombre, e.investigador_apellido].filter(Boolean).join(" ")} ({e.investigador_email || "sin correo"})
              </p>
              <p>
                <strong>Perfil:</strong> {e.investigador_profesion || "—"} · {e.investigador_pais || "—"}
              </p>
              <p><strong>Datos de descubrimiento:</strong> fecha {String(data.fecha_hallazgo || "—")} · explorador {String(data.explorador_id || "—")}</p>
              <p><strong>Referencias:</strong></p>
              <ul style={{ paddingLeft: "1rem" }}>
                {(e.referencias || []).map((r) => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" rel="noreferrer" className="catalog-clear-filter">
                      {r.titulo || r.url}
                    </a>
                  </li>
                ))}
                {(e.referencias || []).length === 0 ? <li>Sin referencias</li> : null}
              </ul>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default function InvestigadorFosilDetallePage() {
  const params = useParams();
  const id = String(params.id ?? "");

  return (
    <PanelGuard need={NEED_INVESTIGADOR}>
      <header style={{ marginBottom: "1.5rem" }}>
        <span className="sec-eyebrow">Investigación</span>
        <h1 className="sec-h" style={{ marginTop: "0.5rem" }}>
          Detalle científico · ID {id}
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ marginTop: "1rem" }}>
          <Link href="/panel/investigador" className="catalog-clear-filter">
            ← Volver al panel
          </Link>
        </p>
      </header>
      <DetalleBody />
    </PanelGuard>
  );
}
