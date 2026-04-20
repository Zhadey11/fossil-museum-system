"use client";

import { useMemo, useState } from "react";
import { multimediaAbsUrl, type MultimediaRow } from "@/lib/api";

type Props = {
  nombreFosil: string;
  media: MultimediaRow[];
};

export function FosilMediaGallery({ nombreFosil, media }: Props) {
  const images = useMemo(() => media.filter((m) => m.tipo === "imagen"), [media]);
  const videos = useMemo(() => media.filter((m) => m.tipo === "video"), [media]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section style={{ display: "grid", gap: "0.9rem" }}>
      <h2 className="sec-h" style={{ fontSize: "1.1rem" }}>
        Galería de imágenes
      </h2>
      {images.length === 0 ? (
        <p className="sec-body">No hay imágenes registradas para este fósil.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "0.8rem",
          }}
        >
          {images.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--surface)",
                textAlign: "left",
                cursor: "zoom-in",
              }}
            >
              <img
                src={multimediaAbsUrl(m.url)}
                alt={m.descripcion || m.nombre_archivo || nombreFosil}
                style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {videos.length > 0 ? (
        <>
          <h3 className="sec-h" style={{ fontSize: "1rem" }}>
            Video
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {videos.map((m) => (
              <video
                key={m.id}
                src={multimediaAbsUrl(m.url)}
                controls
                preload="metadata"
                style={{ width: "100%", borderRadius: 8, border: "1px solid var(--border)" }}
              />
            ))}
          </div>
        </>
      ) : null}

      {activeIdx != null ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8,7,5,0.9)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <img
            src={multimediaAbsUrl(images[activeIdx].url)}
            alt={images[activeIdx].descripcion || images[activeIdx].nombre_archivo || nombreFosil}
            style={{ maxWidth: "min(96vw, 1100px)", maxHeight: "90vh", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
