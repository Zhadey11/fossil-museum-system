import type { PeriodoGeologicoSlug } from "./timeline";

export type MockFossil = {
  id: string;
  name: string;
  /** Alineado a dbo.CATEGORIA_FOSIL / etiqueta de colección. */
  category: string;
  /**
   * Periodo geológico (demo) — mismo criterio que dbo.PERIODO_GEOLOGICO.id vía slug.
   * Backend: filtrar con sp_buscar_fosiles @periodo_id.
   */
  periodoSlug: PeriodoGeologicoSlug;
  image: string;
  /** Texto opcional para tarjetas destacadas (solo diseño). */
  description?: string;
};

export const mockFossils: MockFossil[] = [
  {
    id: "m1",
    name: "Amonita spiralis",
    category: "Cefalópodos",
    periodoSlug: "jurasico",
    image: "/catalogo-imagenes/amonita.svg",
    description:
      "Ejemplo de pieza destacada para la vitrina del catálogo visual.",
  },
  {
    id: "m2",
    name: "Trilobita paradoxides",
    category: "Artrópodos",
    periodoSlug: "cambrico",
    image: "/catalogo-imagenes/trilobite.svg",
  },
  {
    id: "m3",
    name: "Diente de megalodonte",
    category: "Condrictios",
    periodoSlug: "cretacico",
    image: "/catalogo-imagenes/megalodon.svg",
  },
  {
    id: "m4",
    name: "Helecho carbonífero",
    category: "Plantas fósiles",
    periodoSlug: "devonico",
    image: "/catalogo-imagenes/helecho.svg",
  },
  {
    id: "m5",
    name: "Cráneo de terópodo",
    category: "Dinosaurios",
    periodoSlug: "jurasico",
    image: "/catalogo-imagenes/dinosaurio.svg",
  },
  {
    id: "m6",
    name: "Arrecife de coral",
    category: "Cnidarios",
    periodoSlug: "devonico",
    image: "/catalogo-imagenes/corales.svg",
  },
];
