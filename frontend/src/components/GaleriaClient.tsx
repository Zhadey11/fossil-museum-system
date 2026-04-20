"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ItemGaleriaInstalacion } from "@/data/instalacionesGaleria";

type Props = {
  items: ItemGaleriaInstalacion[];
};

export function GaleriaClient({ items }: Props) {
  const [categoria, setCategoria] = useState("Todas");
  const [active, setActive] = useState<number | null>(null);
  const cats = ["Todas", "Actividades", "Enseñanza", "Instalaciones"];
  const filtered = useMemo(
    () =>
      categoria === "Todas"
        ? items
        : items.filter((i) => i.subtitulo.toLowerCase().includes(categoria.toLowerCase())),
    [items, categoria],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="sw-page galeria-page" style={{ background: "var(--surface)" }}>
      <section className="gallery-intro" style={{ paddingTop: "1rem" }}>
        <span className="sec-eyebrow">Museo</span>
        <h1 className="sec-h">
          Galería de <em>instalaciones</em>
        </h1>
        <div className="sec-rule" />
        <p className="sec-body" style={{ margin: "1.5rem auto 0", maxWidth: "42rem" }}>
          Recorrido visual de salas y espacios del museo.
        </p>
      </section>

      <section style={{ maxWidth: "1260px", margin: "0 auto", padding: "0 clamp(1rem, 4vw, 4rem) 2.5rem" }}>
        <div className="galeria-filters">
          {cats.map((c) => (
            <button
              key={c}
              className={`catalog-pill galeria-filter-pill ${categoria === c ? "active" : ""}`}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="gallery-masonry">
          {filtered.map((item, idx) => (
            <figure
              key={item.id}
              className="gcard"
              style={{ minHeight: idx % 4 === 0 ? 360 : 280, display: "flex", flexDirection: "column" }}
            >
              <button
                type="button"
                style={{ position: "relative", height: idx % 4 === 0 ? 300 : 220, overflow: "hidden" }}
                onClick={() => setActive(idx)}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.titulo}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover", display: "block" }}
                />
                <span className="gallery-hover-overlay">{item.descripcion}</span>
              </button>
              <figcaption style={{ padding: "1rem 1rem 1.1rem" }}>
                <p className="gcard-period">{item.subtitulo}</p>
                <p className="gcard-name" style={{ fontSize: "1.35rem" }}>
                  {item.titulo}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      {active != null && filtered[active] ? (
        <div className="gallery-lightbox" onClick={() => setActive(null)}>
          <button type="button" className="gallery-lb-close" onClick={() => setActive(null)}>
            ×
          </button>
          <button
            type="button"
            className="gallery-lb-nav"
            onClick={(e) => {
              e.stopPropagation();
              setActive((v) => (v == null ? 0 : (v - 1 + filtered.length) % filtered.length));
            }}
          >
            ‹
          </button>
          <div className="gallery-lb-media">
            <Image
              src={filtered[active].imageSrc}
              alt={filtered[active].titulo}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
            />
          </div>
          <button
            type="button"
            className="gallery-lb-nav"
            onClick={(e) => {
              e.stopPropagation();
              setActive((v) => (v == null ? 0 : (v + 1) % filtered.length));
            }}
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
