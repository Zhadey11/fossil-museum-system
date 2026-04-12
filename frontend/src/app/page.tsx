import Link from "next/link";
import { AboutIllustration } from "@/components/AboutIllustration";
import { DustParticles } from "@/components/DustParticles";
import { GalleryCard } from "@/components/GalleryCard";
import { HeroFossilSvg } from "@/components/HeroFossilSvg";
import { Reveal } from "@/components/Reveal";
import { mockFossils } from "@/data/mockFossils";

const galleryVariants = [
  "tall",
  "default",
  "default",
  "wide",
  "default",
  "default",
] as const;

const galleryDelays = [0, 100, 200, 300, 400, 500];

export default function Home() {
  return (
    <>
      <section id="hero">
        <div className="hero-bg" aria-hidden />
        <div
          className="hero-photo-layer"
          style={{ backgroundImage: "url('/images/FondoInicial.jpg')" }}
          aria-hidden
        />
        <div className="grain" aria-hidden />
        <div className="hero-vignette" aria-hidden />
        <div className="shaft" aria-hidden />
        <DustParticles />
        <HeroFossilSvg />

        <div className="hero-content">
          <p className="hero-eyebrow">
            Desde 1987 · Colección fósil · 12.400+ especímenes
          </p>
          <h1 className="hero-title">
            <span className="hero-brand-line">
              <b>Stone</b>Wake
            </span>
            <em>Museum</em>
          </h1>
          <div className="hero-rule" aria-hidden />
          <p className="hero-sub">
            Trescientos millones de años de historia del planeta, tallados en
            piedra y listos para descubrirse.
          </p>
          <div className="hero-btns">
            <Link href="/catalogo" className="btn-fill">
              Explorar colección
            </Link>
            <Link href="#about" className="btn-out">
              Nuestra historia
            </Link>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden>
          <span>Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <path
              d="M8 0v20M1 13l7 8 7-8"
              stroke="rgba(200,130,10,.7)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </section>

      <Reveal className="feat-band" delayMs={0}>
        <div className="feat-band-inner">
          <div className="feat-stat">
            <span className="feat-num">12.400+</span>
            <span className="feat-lbl">Especímenes</span>
          </div>
          <div className="feat-stat">
            <span className="feat-num">540M</span>
            <span className="feat-lbl">Años representados</span>
          </div>
          <div className="feat-stat">
            <span className="feat-num">6</span>
            <span className="feat-lbl">Galerías</span>
          </div>
          <div className="feat-stat">
            <span className="feat-num">38</span>
            <span className="feat-lbl">Países de origen</span>
          </div>
        </div>
      </Reveal>

      <section id="gallery">
        <div className="gallery-intro">
          <Reveal>
            <span className="sec-eyebrow">Colección destacada</span>
            <h2 className="sec-h">
              Las galerías <em>permanentes</em>
            </h2>
            <div className="sec-rule" />
            <p className="sec-body">
              Cada pieza es un capítulo; juntas cuentan la mayor historia jamás
              escrita. Datos de muestra — búsqueda y filtros en otra capa.
            </p>
          </Reveal>
        </div>

        <div className="gallery-grid">
          {mockFossils.map((fossil, i) => (
            <GalleryCard
              key={fossil.id}
              name={fossil.name}
              category={fossil.category}
              imageSrc={fossil.image}
              description={fossil.description}
              variant={galleryVariants[i] ?? "default"}
              delayMs={galleryDelays[i] ?? 0}
            />
          ))}
        </div>
      </section>

      <section id="about">
        <Reveal variant="reveal-l" className="about-vis">
          <div className="about-frame">
            <div className="about-glow" />
            <div className="about-svg-wrap">
              <AboutIllustration />
            </div>
            <div className="about-corner tl" />
            <div className="about-corner tr" />
            <div className="about-corner bl" />
            <div className="about-corner br" />
            <span className="about-label">Detalle de espécimen — Galería I</span>
            <span className="about-year">Est. 1987</span>
          </div>
          <div className="about-accent" aria-hidden />
        </Reveal>

        <Reveal variant="reveal-r">
          <span className="sec-eyebrow">Nuestra misión</span>
          <h2 className="sec-h">
            Donde la <em>Tierra</em>
            <br />
            cuenta su historia
          </h2>
          <div className="sec-rule" />
          <p className="sec-body">
            Stonewake Museum nace de una idea sencilla: cada roca esconde un
            mundo. Durante décadas hemos reunido, preservado e interpretado el
            registro fósil para acercar el pasado profundo a visitantes y
            estudiantes.
          </p>
          <p className="sec-body" style={{ marginTop: "1.2rem" }}>
            La colección abarca desde los primeros organismos de complejidad
            hasta los grandes gigantes del Mesozoico. Cada ficha es una página
            de un mismo libro.
          </p>
          <div className="pullquote">
            <p>
              «El registro fósil es la única autobiografía que la Tierra ha
              escrito.»
            </p>
            <cite>— Dra. Elena Marsh, directora fundadora</cite>
          </div>
        </Reveal>
      </section>

      <section id="timeline">
        <div className="tl-header">
          <Reveal>
            <span className="sec-eyebrow">Registro geológico</span>
            <h2 className="sec-h">
              Un viaje por el <em>tiempo profundo</em>
            </h2>
            <div className="sec-rule" />
            <p className="sec-body" style={{ margin: "0 auto" }}>
              De la primera vida compleja a la última gran extinción: hitos del
              planeta en un solo recorrido.
            </p>
          </Reveal>
        </div>

        <div className="tl-wrap">
          <div className="tl-line" aria-hidden />

          <Reveal className="tl-item">
            <div className="tl-left">
              <div className="tl-card">
                <p className="tl-era">Período Cámbrico</p>
                <h3 className="tl-name">La explosión de la vida</h3>
                <p className="tl-desc">
                  Aparecen casi todos los filos animales. Los trilobites
                  dominan los mares poco profundos.
                </p>
              </div>
            </div>
            <div className="tl-mid">
              <div className="tl-dot" />
              <span className="tl-mya">541 Ma</span>
            </div>
            <div className="tl-right" />
          </Reveal>

          <Reveal className="tl-item">
            <div className="tl-left" />
            <div className="tl-mid">
              <div className="tl-dot" />
              <span className="tl-mya">419 Ma</span>
            </div>
            <div className="tl-right">
              <div className="tl-card">
                <p className="tl-era">Período Devónico</p>
                <h3 className="tl-name">La edad de los peces</h3>
                <p className="tl-desc">
                  Los peces se diversifican; surgen los primeros bosques. La
                  vida explora la costa.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="tl-item">
            <div className="tl-left">
              <div className="tl-card">
                <p className="tl-era">Período Jurásico</p>
                <h3 className="tl-name">La era de los gigantes</h3>
                <p className="tl-desc">
                  Sauropodos y terópodos; los primeros pájaros surgen de linajes
                  de dinosaurios emplumados.
                </p>
              </div>
            </div>
            <div className="tl-mid">
              <div className="tl-dot" />
              <span className="tl-mya">201 Ma</span>
            </div>
            <div className="tl-right" />
          </Reveal>

          <Reveal className="tl-item">
            <div className="tl-left" />
            <div className="tl-mid">
              <div className="tl-dot" />
              <span className="tl-mya">66 Ma</span>
            </div>
            <div className="tl-right">
              <div className="tl-card">
                <p className="tl-era">Fin del Cretácico</p>
                <h3 className="tl-name">Antes del silencio</h3>
                <p className="tl-desc">
                  Un mundo de biodiversidad extraordinaria truncado por el
                  impacto de Chicxulub.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="visit">
        <Reveal variant="reveal-l">
          <span className="sec-eyebrow">Planifica tu visita</span>
          <h2 className="sec-h">
            Ven a <em>explorar</em>
            <br />
            con nosotros
          </h2>
          <div className="sec-rule" />
          <p className="sec-body">
            Abierto todo el año: visitas guiadas, talleres y programas
            educativos (solo referencia visual).
          </p>
          <div className="visit-cards">
            <div className="vcard">
              <span className="vcard-icon">🕙</span>
              <p className="vcard-label">Horario</p>
              <p className="vcard-val">
                Mar – Dom
                <br />
                9:00 – 18:00
              </p>
            </div>
            <div className="vcard">
              <span className="vcard-icon">🎟</span>
              <p className="vcard-label">Entradas</p>
              <p className="vcard-val">
                Adultos 18 €
                <br />
                Estudiantes 10 €
                <br />
                Menores de 5: gratis
              </p>
            </div>
            <div className="vcard">
              <span className="vcard-icon">📍</span>
              <p className="vcard-label">Ubicación</p>
              <p className="vcard-val">
                1 Stonewake Drive
                <br />
                Parque del Patrimonio Natural
              </p>
            </div>
            <div className="vcard">
              <span className="vcard-icon">📞</span>
              <p className="vcard-label">Contacto</p>
              <p className="vcard-val">
                info@stonewake.org
                <br />
                (555) 012-3456
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal variant="reveal-r" className="map-box">
          <div className="map-grid" aria-hidden />
          <div className="map-glow" aria-hidden />
          <div className="map-pin" aria-hidden>
            📍
          </div>
          <p className="map-addr">
            1 Stonewake Drive
            <br />
            Parque del Patrimonio Natural
          </p>
          <span className="map-badge">Abierto mar – dom</span>
        </Reveal>
      </section>

      <section id="newsletter">
        <div className="nl-wrap">
          <Reveal>
            <span className="sec-eyebrow">Mantente al día</span>
            <h2
              className="sec-h"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)" }}
            >
              No te pierdas ninguna <em>exposición</em>
            </h2>
            <div className="sec-rule" style={{ margin: "1.4rem auto" }} />
            <p className="sec-body" style={{ margin: "0 auto" }}>
              Novedades sobre exhibiciones y eventos (formulario solo visual).
            </p>
            <form className="nl-form" aria-label="Newsletter (no funcional)">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                disabled
                readOnly
              />
              <button type="button" disabled>
                Suscribirse
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
