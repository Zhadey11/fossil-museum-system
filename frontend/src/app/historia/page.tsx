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
          <h2 className="historia-h2">Orígenes</h2>
          <p className="sec-body">
            En 1987 un grupo de naturalistas y docentes fundó el museo con un
            acervo modesto y una ambición clara: que el público pudiera{" "}
            <em>ver</em> el tiempo geológico con las manos y los ojos. Desde
            entonces, la colección ha crecido con donaciones, excavaciones
            autorizadas e intercambios con instituciones hermanas.
          </p>
        </Reveal>

        <Reveal>
          <h2 className="historia-h2">Hoy</h2>
          <p className="sec-body">
            Conservación climatizada, digitalización de fichas y salas temáticas
            permiten combinar la experiencia clásica del museo con herramientas
            actuales. El equipo sigue ampliando el conocimiento sobre
            biodiversidad antigua y el contexto geológico de cada pieza.
          </p>
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
            <Link href="/#timeline" className="btn-out">
              Tiempo profundo
            </Link>
            <Link href="/catalogo" className="btn-fill">
              Ver colección
            </Link>
          </div>
          <Link href="/" className="historia-back">
            ← Volver al inicio
          </Link>
        </Reveal>
      </article>
    </div>
  );
}
