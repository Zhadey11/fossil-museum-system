import Link from "next/link";
import Image from "next/image";
import { HeroFossilSvg } from "@/components/HeroFossilSvg";
import { HomeGalleryCarousel, HomeNewsletterForm, HomeStats } from "@/components/HomeSectionsClient";
import { Reveal } from "@/components/Reveal";
import { itemsGaleriaInstalaciones } from "@/data/instalacionesGaleria";
import { fetchFosilesPublic } from "@/lib/api";

export default async function Home() {
  const galeriaLugar = itemsGaleriaInstalaciones().slice(0, 6);
  const api = await fetchFosilesPublic({ page: 1, page_size: 120 });
  const rows = api.ok ? api.data : [];
  const years = rows
    .map((r) => Number(r.periodo_id || r.era_id || 0))
    .filter((n) => Number.isFinite(n) && n > 0);
  const oldest = years.length ? Math.max(...years) : 0;
  const metrics = {
    specimens: api.total || rows.length,
    years: oldest > 0 ? oldest * 10 : 0,
    galleries: new Set(rows.map((r) => r.categoria_codigo).filter(Boolean)).size || 1,
    countries: new Set(rows.map((r) => String(r.codigo_unico || "").slice(0, 3)).filter(Boolean)).size || 1,
  };

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
            <Link href="/historia" className="btn-out">
              Nuestra historia
            </Link>
          </div>
        </div>

      </section>

      <Reveal className="feat-band" delayMs={0}>
        <HomeStats metrics={metrics} />
      </Reveal>

      <section id="gallery">
        <div className="gallery-intro">
          <Reveal>
            <span className="sec-eyebrow">El museo</span>
            <h2 className="sec-h">
              Galerías y <em>espacios</em>
            </h2>
            <div className="sec-rule" />
            <p className="sec-body">
              Recorrido visual por salas y ambientes del museo. Esta sección presenta
              espacios de exhibición y áreas institucionales para acompañar la visita.
            </p>
          </Reveal>
        </div>

        <HomeGalleryCarousel items={galeriaLugar} />
      </section>

      <section id="about">
        <Reveal variant="reveal-l" className="about-vis">
            <div className="about-frame">
            <div className="about-glow" />
              <div className="about-svg-wrap" style={{ overflow: "hidden" }}>
                <Image
                  src="/images/FondoInicial.jpg"
                  alt="Fósil en exhibición"
                  width={1200}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </div>
            <span className="about-label">Detalle de espécimen — Galería I</span>
            <span className="about-year">Est. 1987</span>
          </div>
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
          <div className="about-readmore">
            <Link href="/historia" className="btn-fill">
              Leer más
            </Link>
          </div>
        </Reveal>
      </section>

      <section id="visit">
        <Reveal>
          <span className="sec-eyebrow">Planifica tu visita</span>
          <h2 className="sec-h">
            Ven a <em>explorar</em>
            <br />
            con nosotros
          </h2>
          <div className="sec-rule" />
          <p className="sec-body">
            Abierto todo el año: visitas guiadas, talleres y programas
            educativos para todas las edades.
          </p>
          <div className="about-readmore">
            <Link href="/visita" className="btn-fill">
              Leer más
            </Link>
          </div>
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
              Recibí novedades sobre exhibiciones, colecciones y actividades
              académicas del museo.
            </p>
            <HomeNewsletterForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
