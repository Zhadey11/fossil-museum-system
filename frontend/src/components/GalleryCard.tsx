"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";

export type GalleryCardVariant = "default" | "tall" | "wide";

type GalleryCardProps = {
  name: string;
  category: string;
  categoryBadge?: string;
  eraLabel?: string;
  imageSrc: string;
  description?: string;
  variant?: GalleryCardVariant;
  delayMs?: number;
  /** Destino del enlace (ficha, historia, catálogo, etc.). */
  fichaHref?: string;
  /** Texto del CTA (por defecto “Ver ficha”). */
  linkLabel?: string;
  /** Si la imagen principal falla (404, etc.), se muestra esta URL una vez. */
  fallbackSrc?: string;
  /** En catálogo conviene imagen más clara para reconocer especie/material. */
  dimImage?: boolean;
};

export function GalleryCard({
  name,
  category,
  categoryBadge,
  eraLabel,
  imageSrc,
  description,
  variant = "default",
  delayMs = 0,
  fichaHref,
  linkLabel = "Ver ficha",
  fallbackSrc,
  dimImage = true,
}: GalleryCardProps) {
  const [displaySrc, setDisplaySrc] = useState(imageSrc);

  useEffect(() => {
    setDisplaySrc(imageSrc);
  }, [imageSrc]);

  const extra = [variant === "tall" && "tall", variant === "wide" && "wide"]
    .filter(Boolean)
    .join(" ");

  function onImgError() {
    if (fallbackSrc && displaySrc !== fallbackSrc) {
      setDisplaySrc(fallbackSrc);
    }
  }

  return (
    <Reveal className={`gcard ${extra}`.trim()} delayMs={delayMs}>
      <div className="gcard-inner">
        <div className="gcard-art">
          <img
            src={displaySrc}
            alt={name}
            className={`gcard-img ${dimImage ? "" : "gcard-img-clear"}`.trim()}
            loading="lazy"
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            onError={onImgError}
          />
        </div>
        <div className="gcard-info">
          <div className="gcard-meta">
            {categoryBadge ? <span className="gcard-badge">{categoryBadge}</span> : null}
            <p className="gcard-period">{category}</p>
          </div>
          <h3 className="gcard-name">{name}</h3>
          {eraLabel ? <p className="gcard-era">{eraLabel}</p> : null}
          {description ? <p className="gcard-desc">{description}</p> : null}
          {fichaHref ? (
            <Link href={fichaHref} className="gcard-link">
              {linkLabel}
              <svg viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
