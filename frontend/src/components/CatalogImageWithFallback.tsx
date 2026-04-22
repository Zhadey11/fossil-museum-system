"use client";

import { useState } from "react";

type Props = {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
};

/**
 * Evita next/image con URLs del API: si el archivo no existe, el optimizador falla ("received null");
 * usamos <img> con multimediaAbsUrl (URL absoluta a `NEXT_PUBLIC_API_URL`) y fallback.
 * Con <img> + onError pasamos al placeholder local.
 */
export function CatalogImageWithFallback({ src, fallback, alt, className }: Props) {
  const [url, setUrl] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        setUrl((u) => (u === fallback ? u : fallback));
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}
