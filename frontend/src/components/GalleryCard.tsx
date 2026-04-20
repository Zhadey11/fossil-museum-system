"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export type GalleryCardVariant = "default" | "tall" | "wide";

type GalleryCardProps = {
  name: string;
  category: string;
  imageSrc: string;
  description?: string;
  variant?: GalleryCardVariant;
  delayMs?: number;
  /** Enlace a la ficha del fósil (por defecto solo catálogo). */
  fichaHref?: string;
};

export function GalleryCard({
  name,
  category,
  imageSrc,
  description,
  variant = "default",
  delayMs = 0,
  fichaHref = "/catalogo",
}: GalleryCardProps) {
  const extra = [variant === "tall" && "tall", variant === "wide" && "wide"]
    .filter(Boolean)
    .join(" ");

  return (
    <Reveal className={`gcard ${extra}`.trim()} delayMs={delayMs}>
      <div className="gcard-inner">
        <div className="gcard-art">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="gcard-img"
            unoptimized
          />
        </div>
        <div className="gcard-info">
          <p className="gcard-period">{category}</p>
          <h3 className="gcard-name">{name}</h3>
          {description ? <p className="gcard-desc">{description}</p> : null}
          <Link href={fichaHref} className="gcard-link">
            Ver ficha
            <svg viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
