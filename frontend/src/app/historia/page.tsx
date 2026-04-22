import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Historia",
  description:
    "Orígenes, misión y legado del Stonewake Museum — colección fósil desde 1987.",
};

export default function HistoriaPage() {
  return (
    <div
      className="sw-page historia-page"
      style={{ background: "var(--ink)", color: "var(--bone)" }}
    >
      <header className="historia-hero">
        <img src="/images/FondoInicial.jpg" alt="Archivo histórico del museo" className="historia-hero-img" />
        <Reveal>
          <span className="sec-eyebrow">Stonewake Museum</span>
          <h1 className="sec-h">
            Donde la <em>Tierra</em> cuenta su historia
          </h1>
          <div className="sec-rule" />
          <p className="sec-body historia-lead">
            Una institución dedicada a preservar, estudiar y comunicar el
            registro fósil como memoria viva del planeta.
          </p>
        </Reveal>
      </header>

      <article className="historia-article">
        <Reveal>
          <h2 className="historia-h2">Nuestra misión</h2>
          <p className="sec-body">
            Stonewake Museum nace de una idea sencilla: cada roca esconde un
            mundo. Durante décadas hemos reunido, preservado e interpretado el
            registro fósil para acercar el pasado profundo a visitantes y
            estudiantes.
          </p>
          <p className="sec-body" style={{ marginTop: "1.25rem" }}>
            La colección abarca desde los primeros organismos de complejidad
            hasta los grandes gigantes del Mesozoico. Cada ficha es una página
            de un mismo libro.
          </p>
        </Reveal>

        <Reveal>
          <div className="pullquote" style={{ marginTop: "2.5rem" }}>
            <p>
              «El registro fósil es la única autobiografía que la{" "}
              <em>Tierra</em> ha escrito.»
            </p>
            <cite>— Dra. Elena Marsh, directora fundadora</cite>
          </div>
        </Reveal>

        <Reveal>
          <h2 className="historia-h2">Orígenes hasta hoy</h2>
          <div className="historia-timeline">
            <div><strong>1987</strong><p>Fundación del museo por naturalistas y docentes.</p></div>
            <div><strong>1999</strong><p>Primera sala permanente de fósiles mesozoicos.</p></div>
            <div><strong>2014</strong><p>Inicio del archivo digital y fichas científicas.</p></div>
            <div><strong>2026</strong><p>Apertura del catálogo público y mapa interactivo.</p></div>
          </div>
        </Reveal>
        <Reveal>
          <img src="/images/FondoInicial.jpg" alt="Sala de colección fósil" className="historia-inline-img" />
        </Reveal>

        <Reveal>
          <h2 className="historia-h2">Educación y comunidad</h2>
          <p className="sec-body">
            Talleres, visitas guiadas y material para aulas apoyan a docentes y
            familias. El museo entiende la paleontología como puente entre
            ciencia, cultura y curiosidad — sin sustituir el trabajo de
            investigación especializada, sino haciéndolo accesible con rigor y
            claridad.
          </p>
        </Reveal>

        <Reveal className="historia-cta">
          <p className="sec-body" style={{ marginBottom: "1rem" }}>
            Explora la línea del tiempo en la página principal o entra en la
            colección.
          </p>
          <div className="historia-cta-btns">
            <Link href="/tiempo-profundo" className="btn-out">
              Explorar la línea del tiempo &gt;
            </Link>
            <Link href="/catalogo" className="btn-fill">
              Ver colección
            </Link>
          </div>
          <Link href="/" className="historia-back">
            &lt; Volver al inicio
          </Link>
        </Reveal>
      </article>
    </div>
  );
}
