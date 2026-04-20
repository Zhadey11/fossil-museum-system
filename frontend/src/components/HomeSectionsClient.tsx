"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { postSuscriptor } from "@/lib/api";
import type { ItemGaleriaInstalacion } from "@/data/instalacionesGaleria";

type Metrics = {
  specimens: number;
  years: number;
  galleries: number;
  countries: number;
};

export function HomeStats({ metrics }: { metrics: Metrics }) {
  return (
    <div className="feat-band-inner feat-band-compact">
      <div className="feat-stat"><span className="feat-num">{metrics.specimens}</span><span className="feat-lbl">Especímenes</span></div>
      <div className="feat-stat"><span className="feat-num">{metrics.years}</span><span className="feat-lbl">Años representados</span></div>
      <div className="feat-stat"><span className="feat-num">{metrics.galleries}</span><span className="feat-lbl">Galerías</span></div>
      <div className="feat-stat"><span className="feat-num">{metrics.countries}</span><span className="feat-lbl">Países de origen</span></div>
    </div>
  );
}

export function HomeGalleryCarousel({ items }: { items: ItemGaleriaInstalacion[] }) {
  const [index, setIndex] = useState(0);
  const valid = useMemo(() => items.slice(0, 8), [items]);
  useEffect(() => {
    if (valid.length <= 1) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % valid.length), 4000);
    return () => window.clearInterval(id);
  }, [valid.length]);
  if (valid.length === 0) return null;
  const current = valid[index];
  return (
    <div className="home-carousel">
      <button type="button" className="carousel-arrow" onClick={() => setIndex((v) => (v - 1 + valid.length) % valid.length)}>‹</button>
      <article className="home-carousel-slide" style={{ backgroundImage: `url(${current.imageSrc})` }}>
        <div className="home-carousel-overlay">
          <span className="home-carousel-badge">{current.subtitulo}</span>
          <h3>{current.titulo}</h3>
          <p>{current.descripcion}</p>
          <Link href="/galeria" className="btn-fill">Ver galería →</Link>
        </div>
      </article>
      <button type="button" className="carousel-arrow" onClick={() => setIndex((v) => (v + 1) % valid.length)}>›</button>
    </div>
  );
}

export function HomeNewsletterForm() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await postSuscriptor(correo);
      setMessage("¡Suscripción exitosa!");
      setCorreo("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo suscribir");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="nl-form" onSubmit={onSubmit}>
      <input type="email" placeholder="Tu correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
      <button type="submit" disabled={loading}>{loading ? "Enviando…" : "Suscribirse"}</button>
      {message ? <p className="nl-msg">{message}</p> : null}
    </form>
  );
}
