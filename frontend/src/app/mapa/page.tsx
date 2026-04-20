import type { Metadata } from "next";
import Link from "next/link";
import type { MapFossilPoint } from "@/data/mapFossils";
import { MapaFosilesLoader } from "@/components/MapaFosilesLoader";
import type { ApiFosilRow } from "@/lib/api";
import { fetchFosilesPublic, multimediaAbsUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Mapa de hallazgos",
  description: "Explora en el mapa dónde se registraron fósiles publicados.",
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
        thumb: r.portada_url
          ? multimediaAbsUrl(r.portada_url)
          : "/images/FondoInicial.jpg",
        categoria: r.categoria_codigo || "FOS",
      };
    });
}

export default async function MapaPage() {
  const rows: ApiFosilRow[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext && page <= 20) {
    const res = await fetchFosilesPublic({ page, page_size: 100 });
    if (!res.ok) break;
    rows.push(...res.data);
    hasNext = res.has_next;
    page += 1;
  }
  const points = apiRowsToMapPoints(rows);

  return (
    <div className="sw-page mapa-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "0.5rem", paddingBottom: "0.8rem" }}>
        <span className="sec-eyebrow">Georreferencia</span>
        <h1 className="sec-h">
          Mapa de <em>hallazgos</em>
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ margin: "1rem auto 0", maxWidth: "42rem" }}>Cada pin representa un fósil publicado con coordenadas registradas.</p>
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
