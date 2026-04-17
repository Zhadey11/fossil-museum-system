/** Identificadores de era para URL (?era=) y para etiquetar fósiles demo. */
export const TIMELINE_ERA_IDS = [
  "cambrian",
  "devonian",
  "jurassic",
  "cretaceous",
] as const;

export type TimelineEraId = (typeof TIMELINE_ERA_IDS)[number];

export function isTimelineEraId(value: string): value is TimelineEraId {
  return (TIMELINE_ERA_IDS as readonly string[]).includes(value);
}

export type TimelineBlock = {
  id: TimelineEraId;
  eraLabel: string;
  title: string;
  description: string;
  mya: string;
  /** "left" | "right" según el layout actual del home */
  cardSide: "left" | "right";
};

/** Orden y contenido alineado con `page.tsx` (sección #timeline). */
export const TIMELINE_BLOCKS: readonly TimelineBlock[] = [
  {
    id: "cambrian",
    eraLabel: "Período Cámbrico",
    title: "La explosión de la vida",
    description:
      "Aparecen casi todos los filos animales. Los trilobites dominan los mares poco profundos.",
    mya: "541 Ma",
    cardSide: "left",
  },
  {
    id: "devonian",
    eraLabel: "Período Devónico",
    title: "La edad de los peces",
    description:
      "Los peces se diversifican; surgen los primeros bosques. La vida explora la costa.",
    mya: "419 Ma",
    cardSide: "right",
  },
  {
    id: "jurassic",
    eraLabel: "Período Jurásico",
    title: "La era de los gigantes",
    description:
      "Sauropodos y terópodos; los primeros pájaros surgen de linajes de dinosaurios emplumados.",
    mya: "201 Ma",
    cardSide: "left",
  },
  {
    id: "cretaceous",
    eraLabel: "Fin del Cretácico",
    title: "Antes del silencio",
    description:
      "Un mundo de biodiversidad extraordinaria truncado por el impacto de Chicxulub.",
    mya: "66 Ma",
    cardSide: "right",
  },
] as const;

export const TIMELINE_ERA_CATALOG_INTRO: Record<
  TimelineEraId,
  { eyebrow: string; title: string; body: string }
> = {
  cambrian: {
    eyebrow: "Filtrado por era",
    title: "Cámbrico — explosión de la vida",
    body: "Piezas de ejemplo vinculadas a este hito del registro fósil (demo).",
  },
  devonian: {
    eyebrow: "Filtrado por era",
    title: "Devónico — mares y costas en expansión",
    body: "Vegetación y arrecifes; contexto del “tiempo profundo” aplicado al catálogo (demo).",
  },
  jurassic: {
    eyebrow: "Filtrado por era",
    title: "Jurásico — gigantes y amonitas",
    body: "Selección orientativa para explorar el catálogo desde la línea del tiempo (demo).",
  },
  cretaceous: {
    eyebrow: "Filtrado por era",
    title: "Cretácico tardío — antes del gran cierre",
    body: "Última ventana al Mesozoico antes del límite K–Pg (demo).",
  },
};
