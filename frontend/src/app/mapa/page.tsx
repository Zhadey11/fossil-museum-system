import type { Metadata } from "next";
import Link from "next/link";
import type { MapFossilPoint } from "@/data/mapFossils";
import { MapaFosilesLoader } from "@/components/MapaFosilesLoader";
import { fetchMapaPublicoPoints, multimediaAbsUrl } from "@/lib/api";

export const metadata: Metadata = {
  title: "Mapa de hallazgos",
  description: "Explora en el mapa dónde se registraron fósiles publicados.",
};

export default async function MapaPage() {
  const points: MapFossilPoint[] = [];
  const res = await fetchMapaPublicoPoints();
  if (res.ok) {
    for (const r of res.data) {
      const lat = Number(r.latitud);
      const lng = Number(r.longitud);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const canton = (r.canton_nombre || "").trim();
      const provincia = (r.provincia_nombre || "").trim();
      const pais = (r.pais_nombre || "Costa Rica").trim() || "Costa Rica";
      const locLine = [canton, provincia].filter(Boolean).join(" · ");
      points.push({
        id: String(r.id),
        slug: r.slug || String(r.id),
        nombre: r.nombre,
        latitud: lat,
        longitud: lng,
        pais,
        provincia: provincia || "—",
        canton: canton || undefined,
        resumen: locLine ? `Registro publicado · ${locLine}` : "Registro publicado",
        descripcion: "Hallazgo disponible en la ficha pública.",
        thumb: r.portada_url ? multimediaAbsUrl(r.portada_url) : "/images/FondoInicial.jpg",
        categoria: r.categoria_codigo || "FOS",
      });
    }
  }

  return (
    <div className="sw-page mapa-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "0.5rem", paddingBottom: "0.8rem" }}>
        <span className="sec-eyebrow">Georreferencia</span>
        <h1 className="sec-h">
          Mapa de <em>hallazgos</em>
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ margin: "1rem auto 0", maxWidth: "42rem" }}>
          Mapa de fósiles publicados. Al aprobar nuevos hallazgos con coordenadas válidas, aparecen
          automáticamente aquí.
        </p>
      </section>

      <section style={{ padding: "0 clamp(1rem, 4vw, 4rem) 4rem" }}>
        <MapaFosilesLoader points={points} />
        <p className="mapa-fosiles-back">
          <Link href="/catalogo" className="catalog-clear-filter">
            &lt; Colección
          </Link>
        </p>
      </section>
    </div>
  );
}
