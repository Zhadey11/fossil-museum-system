import type { Metadata } from "next";
import Link from "next/link";
import { TIMELINE_BLOCKS } from "@/data/timeline";

export const metadata: Metadata = {
  title: "Tiempo profundo",
};

export default function TiempoProfundoPage() {
  return (
    <div style={{ background: "var(--ink)", minHeight: "100vh" }}>

      {/* Hero */}
      <div className="tp-hero">
        <div className="tp-hero-glow" aria-hidden />
        <div className="tp-hero-inner">
          <span className="sec-eyebrow">Registro geológico</span>
          <h1 className="sec-h tp-hero-title">Tiempo profundo</h1>
          <div className="sec-rule" />
          <p className="sec-body tp-hero-sub">
            Cuatro ventanas al pasado: los períodos que forjaron la vida tal como la conocemos.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <section style={{ maxWidth: "1080px", margin: "0 auto", padding: "4rem 1.25rem 2rem" }}>
        <div className="tl-wrap tl-wrap-center">
          <div className="tl-line" aria-hidden />
          {TIMELINE_BLOCKS.map((b) => (
            <article key={b.slug} className="tl-item">
              <div className="tl-left">
                <div className="tl-card">
                  <p className="tl-era">{b.etiquetaPeriodo}</p>
                  <h3 className="tl-name">{b.title}</h3>
                  <p className="tl-desc">{b.description}</p>
                  <Link className="tl-card-cta" href={`/coleccion?periodo=${b.slug}`}>Explorar colección</Link>
                </div>
              </div>
              <div className="tl-mid"><div className="tl-dot" /><span className="tl-mya">{b.mya}</span></div>
              <div className="tl-right" />
            </article>
          ))}
        </div>

        {/* Bottom CTA — centered */}
        <div style={{ paddingTop: "3rem", paddingBottom: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.7 }}>Continúa explorando</span>
          <Link href="/historia" className="btn-out" style={{ minWidth: "18rem" }}>
            Leer la historia del museo
          </Link>
          <Link href="/catalogo" className="btn-fill" style={{ minWidth: "18rem" }}>
            Ver colección de fósiles
          </Link>
        </div>
      </section>
    </div>
  );
}
