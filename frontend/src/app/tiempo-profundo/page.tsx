import type { Metadata } from "next";
import Link from "next/link";
import { TIMELINE_BLOCKS } from "@/data/timeline";

export const metadata: Metadata = {
  title: "Tiempo profundo",
};

export default function TiempoProfundoPage() {
  return (
    <div className="sw-page" style={{ background: "var(--ink)", padding: "7rem 1rem 2.5rem" }}>
      <section style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <span className="sec-eyebrow">Registro geológico</span>
        <h1 className="sec-h">Tiempo profundo</h1>
        <div className="sec-rule" />
        <div className="tl-wrap tl-wrap-center">
          <div className="tl-line" aria-hidden />
          {TIMELINE_BLOCKS.map((b) => (
            <article key={b.slug} className="tl-item">
              <div className="tl-left"><div className="tl-card"><p className="tl-era">{b.etiquetaPeriodo}</p><h3 className="tl-name">{b.title}</h3><p className="tl-desc">{b.description}</p><Link className="tl-card-cta" href={`/coleccion?periodo=${b.slug}`}>Explorar colección</Link></div></div>
              <div className="tl-mid"><div className="tl-dot" /><span className="tl-mya">{b.mya}</span></div>
              <div className="tl-right" />
            </article>
          ))}
        </div>
        <div style={{ paddingTop: "1rem" }}>
          <Link href="/historia" className="btn-out">Leer la historia del museo →</Link>
        </div>
      </section>
    </div>
  );
}
