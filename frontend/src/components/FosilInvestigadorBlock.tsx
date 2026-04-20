"use client";

import { useEffect, useState } from "react";
import {
  fetchEstudiosPorFosil,
  fetchFosilDetalleCompleto,
  type EstudioFosilRow,
} from "@/lib/api";

type Props = { fosilId: number };

function val(v: unknown): string {
  if (v == null || String(v).trim() === "") return "—";
  return String(v);
}

export function FosilInvestigadorBlock({ fosilId }: Props) {
  const [detalle, setDetalle] = useState<Record<string, unknown> | null>(null);
  const [estudios, setEstudios] = useState<EstudioFosilRow[] | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchFosilDetalleCompleto(fosilId)
      .then((d) => {
        if (mounted) setDetalle(d);
      })
      .catch(() => {
        if (mounted) setDetalle(null);
      });
    fetchEstudiosPorFosil(fosilId)
      .then((rows) => {
        if (mounted) setEstudios(rows);
      })
      .catch(() => {
        if (mounted) setEstudios([]);
      });
    return () => {
      mounted = false;
    };
  }, [fosilId]);

  // Si no está autorizado (401/403) o no hay token, no renderiza nada.
  if (!detalle) return null;

  return (
    <section
      className="rounded-sm border p-4"
      style={{ borderColor: "var(--border)", background: "var(--surface)", display: "grid", gap: "1rem" }}
    >
      <h2 className="sec-h" style={{ fontSize: "1.15rem" }}>
        Sección científica (investigador)
      </h2>

      <div className="sec-body">
        <strong>Identificación:</strong> código {val(detalle.codigo_unico)} · campo{" "}
        {val(detalle.numero_campo)} · gabinete {val(detalle.ubicacion_museo)}
      </div>
      <div className="sec-body">
        <strong>Taxonomía:</strong> {val(detalle.reino)} / {val(detalle.filo)} /{" "}
        {val(detalle.clase)} / {val(detalle.orden)} / {val(detalle.familia)} /{" "}
        {val(detalle.genero)} / {val(detalle.especie)} · certeza{" "}
        {val(detalle.certeza_taxonomica)}
      </div>
      <div className="sec-body">
        <strong>Medidas:</strong> largo {val(detalle.largo_cm)} cm · ancho {val(detalle.ancho_cm)}{" "}
        cm · grosor {val(detalle.grosor_cm)} cm
      </div>
      <div className="sec-body">
        <strong>Estado:</strong> completitud {val(detalle.completitud)} · fractura{" "}
        {val(detalle.fractura)} · meteorización {val(detalle.meteorizacion)} · abrasión{" "}
        {val(detalle.abrasion)} · aplastamiento {val(detalle.aplastamiento)} · patología{" "}
        {val(detalle.patologia)} · endurecedor {val(detalle.endurecedor_usado)}
      </div>
      <div className="sec-body">
        <strong>Contexto del hallazgo:</strong> GPS {val(detalle.latitud)}, {val(detalle.longitud)} ·
        cantera/sitio {val(detalle.cantera_sitio)} · UTM {val(detalle.zona_utm)} · condiciones{" "}
        {val(detalle.condiciones_hallazgo)}
      </div>

      <div className="sec-body">
        <strong>Personas involucradas:</strong> colector {val(detalle.colector)} · identificador{" "}
        {val(detalle.identificador)} · preparador {val(detalle.preparador)} · responsable{" "}
        {val(detalle.investigador_responsable)}
      </div>

      <div className="sec-body">
        <strong>Estudios:</strong> {estudios == null ? "cargando…" : `${estudios.length} registrados`}
      </div>
    </section>
  );
}
