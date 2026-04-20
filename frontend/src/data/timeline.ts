/**
 * Geología alineada con SQL Server (FosilesDB):
 * - dbo.ERA_GEOLOGICA — eras (p. ej. Paleozoico id=4, Mesozoico id=5)
 * - dbo.PERIODO_GEOLOGICO — periodos bajo cada era (p. ej. Cambrico, Devonico…)
 *
 * Los `periodoId` y `eraGeologicaId` coinciden con el orden de INSERT en
 * `database/04_datos_prueba.sql` (IDENTITY desde 1).
 *
 * URL del catálogo: ?periodo=<slug> donde slug = nombre en BD en minúsculas sin tilde
 * (coincide con lo que el backend puede mapear a PERIODO_GEOLOGICO.id).
 */

/** Slugs = PERIODO_GEOLOGICO.nombre en minúsculas (como en la BD). */
export const PERIODO_GEOLOGICO_SLUGS = [
  "cambrico",
  "devonico",
  "jurasico",
  "cretacico",
] as const;

export type PeriodoGeologicoSlug = (typeof PERIODO_GEOLOGICO_SLUGS)[number];

export function isPeriodoGeologicoSlug(
  value: string,
): value is PeriodoGeologicoSlug {
  return (PERIODO_GEOLOGICO_SLUGS as readonly string[]).includes(value);
}

/** Compatibilidad con enlaces antiguos (?era=cambrian …). */
const LEGACY_ERA_PARAM_TO_PERIODO: Record<string, PeriodoGeologicoSlug> = {
  cambrian: "cambrico",
  devonian: "devonico",
  jurassic: "jurasico",
  cretaceous: "cretacico",
};

export function resolvePeriodoSlugFromParams(params: {
  periodo?: string;
  era?: string;
}): PeriodoGeologicoSlug | null {
  const rawP = params.periodo?.trim().toLowerCase();
  if (rawP && isPeriodoGeologicoSlug(rawP)) return rawP;

  const rawE = params.era?.trim().toLowerCase();
  if (rawE && rawE in LEGACY_ERA_PARAM_TO_PERIODO) {
    return LEGACY_ERA_PARAM_TO_PERIODO[rawE];
  }

  return null;
}

export type TimelineBlock = {
  /** Slug para ?periodo= — misma lógica que PERIODO_GEOLOGICO.nombre (minúsculas). */
  slug: PeriodoGeologicoSlug;
  /** dbo.PERIODO_GEOLOGICO.id */
  periodoId: number;
  /** dbo.ERA_GEOLOGICA.id */
  eraGeologicaId: number;
  /** Columna PERIODO_GEOLOGICO.nombre (tal cual en BD). */
  nombrePeriodoDb: string;
  /** Texto en pantalla (puede llevar tildes). */
  etiquetaPeriodo: string;
  title: string;
  description: string;
  mya: string;
  cardSide: "left" | "right";
};

/** Línea de tiempo de la landing; cada hito = un periodo geológico del catálogo. */
export const TIMELINE_BLOCKS: readonly TimelineBlock[] = [
  {
    slug: "cambrico",
    periodoId: 1,
    eraGeologicaId: 4,
    nombrePeriodoDb: "Cambrico",
    etiquetaPeriodo: "Período Cámbrico",
    title: "La explosión de la vida",
    description:
      "Aparecen casi todos los filos animales. Los trilobites dominan los mares poco profundos.",
    mya: "541 Ma",
    cardSide: "left",
  },
  {
    slug: "devonico",
    periodoId: 4,
    eraGeologicaId: 4,
    nombrePeriodoDb: "Devonico",
    etiquetaPeriodo: "Período Devónico",
    title: "La edad de los peces",
    description:
      "Los peces se diversifican; surgen los primeros bosques. La vida explora la costa.",
    mya: "419 Ma",
    cardSide: "right",
  },
  {
    slug: "jurasico",
    periodoId: 8,
    eraGeologicaId: 5,
    nombrePeriodoDb: "Jurasico",
    etiquetaPeriodo: "Período Jurásico",
    title: "La era de los gigantes",
    description:
      "Sauropodos y terópodos; los primeros pájaros surgen de linajes de dinosaurios emplumados.",
    mya: "201 Ma",
    cardSide: "left",
  },
  {
    slug: "cretacico",
    periodoId: 9,
    eraGeologicaId: 5,
    nombrePeriodoDb: "Cretacico",
    etiquetaPeriodo: "Fin del Cretácico",
    title: "Antes del silencio",
    description:
      "Un mundo de biodiversidad extraordinaria truncado por el impacto de Chicxulub.",
    mya: "66 Ma",
    cardSide: "right",
  },
] as const;

/** Slug de URL → dbo.PERIODO_GEOLOGICO.id (seed `04_datos_prueba.sql`). */
export const PERIODO_ID_BY_SLUG: Record<PeriodoGeologicoSlug, number> =
  Object.fromEntries(TIMELINE_BLOCKS.map((b) => [b.slug, b.periodoId])) as Record<
    PeriodoGeologicoSlug,
    number
  >;

export function getTimelineBlockBySlug(
  slug: PeriodoGeologicoSlug,
): TimelineBlock {
  const b = TIMELINE_BLOCKS.find((x) => x.slug === slug);
  if (!b) throw new Error(`Periodo no definido en TIMELINE_BLOCKS: ${slug}`);
  return b;
}

export const PERIODO_CATALOG_INTRO: Record<
  PeriodoGeologicoSlug,
  { eyebrow: string; title: string; body: string }
> = {
  cambrico: {
    eyebrow: "Filtrado por periodo (PERIODO_GEOLOGICO)",
    title: "Cambrico — explosión de la vida",
    body: "Piezas demo etiquetadas con periodo_id acorde a la BD. El backend usará dbo.PERIODO_GEOLOGICO.",
  },
  devonico: {
    eyebrow: "Filtrado por periodo (PERIODO_GEOLOGICO)",
    title: "Devonico — mares y costas en expansión",
    body: "Contexto paleozoico tardío; mismo criterio de filtro que sp_buscar_fosiles (@periodo_id).",
  },
  jurasico: {
    eyebrow: "Filtrado por periodo (PERIODO_GEOLOGICO)",
    title: "Jurasico — gigantes y amonitas",
    body: "Mesozoico medio; alineado con era_id Mesozoico y periodo Jurasico en la base.",
  },
  cretacico: {
    eyebrow: "Filtrado por periodo (PERIODO_GEOLOGICO)",
    title: "Cretacico — antes del límite K–Pg",
    body: "Mesozoico tardío; en la BD el periodo Cretacico abarca hasta 66 Ma.",
  },
};
