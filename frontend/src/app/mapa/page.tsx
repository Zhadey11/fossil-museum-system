import type { Metadata } from "next";
import Link from "next/link";
import type { MapFossilPoint } from "@/data/mapFossils";
import { MapaFosilesLoader } from "@/components/MapaFosilesLoader";
import type { ApiFosilRow } from "@/lib/api";
import { fetchFosilesPublic } from "@/lib/api";

export const metadata: Metadata = {
  title: "Mapa de hallazgos",
  description:
    "Explora en el mapa dónde se registraron fósiles publicados (API) o datos demo.",
};

function apiRowsToMapPoints(rows: ApiFosilRow[]): MapFossilPoint[] {
  return rows
    .filter(
      (r) =>
        r.latitud != null &&
        r.longitud != null &&
        Number.isFinite(Number(r.latitud)) &&
        Number.isFinite(Number(r.longitud)),
    )
    .map((r) => {
      const desc = r.descripcion_general?.trim() || "";
      return {
        id: String(r.id),
        slug: r.slug || String(r.id),
        nombre: r.nombre,
        latitud: Number(r.latitud),
        longitud: Number(r.longitud),
        pais: "Costa Rica",
        provincia: "Ver catálogo",
        resumen: desc.length > 120 ? `${desc.slice(0, 117)}…` : desc,
        descripcion: desc,
      };
    });
}

export default async function MapaPage() {
  const res = await fetchFosilesPublic();
  const mapped =
    res.ok && res.data.length > 0 ? apiRowsToMapPoints(res.data) : [];
  const points = mapped.length > 0 ? mapped : undefined;

  return (
    <div className="sw-page mapa-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "2rem" }}>
        <span className="sec-eyebrow">Georreferencia</span>
        <h1 className="sec-h">
          Mapa de <em>hallazgos</em>
        </h1>
        <div className="sec-rule" />
        <p
          className="sec-body"
          style={{ margin: "1.6rem auto 0", maxWidth: "42rem" }}
        >
          Cada pin es un fósil publicado con coordenadas. Si la API no está
          disponible, se muestran puntos de demostración.
        </p>
      </section>

      <section style={{ padding: "0 clamp(1rem, 4vw, 4rem) 4rem" }}>
        <MapaFosilesLoader points={points} />
        <p className="mapa-fosiles-back">
          <Link href="/catalogo" className="catalog-clear-filter">
            ← Colección
          </Link>
        </p>
      </section>
    </div>
  );
}
