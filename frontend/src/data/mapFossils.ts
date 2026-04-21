/** Estructura de puntos georreferenciados para visualización en mapa. */
export type MapFossilPoint = {
  id: string;
  /** Coincide con futuro FOSIL.slug */
  slug: string;
  nombre: string;
  latitud: number;
  longitud: number;
  pais: string;
  provincia: string;
  /** Cantón (Costa Rica) para filtros del mapa */
  canton?: string;
  /** Texto corto para popup */
  resumen: string;
  /** Texto largo para ficha */
  descripcion: string;
  thumb?: string;
  categoria?: string;
};

export const MAP_FOSSIL_POINTS: MapFossilPoint[] = [
  {
    id: "m1",
    slug: "mosasaurio-turrialba",
    nombre: "Diente de mosasaurio (Turrialba)",
    latitud: 9.9008,
    longitud: -83.678,
    pais: "Costa Rica",
    provincia: "Cartago",
    canton: "Turrialba",
    resumen: "Cretácico marino — lutitas del Valle de Turrialba.",
    descripcion:
      "Diente cónico bien preservado de mosasaurio. Hallado en afloramientos de lutita calcárea del Cretácico Superior.",
  },
  {
    id: "m2",
    slug: "cetaceo-talamanca",
    nombre: "Vértebra de cetáceo (Talamanca)",
    latitud: 9.5667,
    longitud: -82.85,
    pais: "Costa Rica",
    provincia: "Limón",
    canton: "Talamanca",
    resumen: "Eoceno — sedimentos marinos en costa caribeña.",
    descripcion:
      "Vértebra lumbar de cetáceo arqueoceto. Contexto de acantilado costero; bioestratigrafía en revisión. Datos ampliados en la ficha técnica.",
  },
  {
    id: "m3",
    slug: "amonita-virilla",
    nombre: "Amonita (cáñon Virilla)",
    latitud: 9.8833,
    longitud: -84.05,
    pais: "Costa Rica",
    provincia: "San José",
    canton: "Puriscal",
    resumen: "Cretácico inferior — cueva calcárea en el cáñon.",
    descripcion:
      "Amonita con ornamentación de costillas; sutura analizada en estudio preliminar. Más imágenes y taxonomía en la ficha.",
  },
  {
    id: "m4",
    slug: "trilobite-cartago",
    nombre: "Trilobita (canteras Cartago)",
    latitud: 9.86,
    longitud: -83.92,
    pais: "Costa Rica",
    provincia: "Cartago",
    canton: "Cartago",
    resumen: "Cámbrico — primer registro documentado en la zona.",
    descripcion:
      "Espécimen completo con mineralización piritica. Fotogrametría y comparación con fauna gondwánica en preparación.",
  },
  {
    id: "m5",
    slug: "coral-turrialba",
    nombre: "Coral tabular (Turrialba)",
    latitud: 10.02,
    longitud: -83.74,
    pais: "Costa Rica",
    provincia: "Cartago",
    canton: "Turrialba",
    resumen: "Jurásico inferior — afloramientos al pie del volcán.",
    descripcion:
      "Colonia de coral tabular con estructura hexagonal. Sección fina y correlación estratigráfica en la ficha extendida.",
  },
  {
    id: "m6",
    slug: "helecho-san-carlos",
    nombre: "Helecho fósil (San Carlos)",
    latitud: 10.3167,
    longitud: -84.5167,
    pais: "Costa Rica",
    provincia: "Alajuela",
    canton: "San Carlos",
    resumen: "Jurásico medio — fronde en lutita carbonosa.",
    descripcion:
      "Impresión de fronde arborescente; indicadores paleoclimáticos descritos en el estudio asociado.",
  },
  {
    id: "g1",
    slug: "guatemala-peten",
    nombre: "Muestra paleontológica (Petén)",
    latitud: 16.9186,
    longitud: -89.9022,
    pais: "Guatemala",
    provincia: "Petén",
    canton: "Flores",
    resumen: "Registro en Guatemala para cobertura regional del mapa.",
    descripcion:
      "Coordenadas de referencia cerca de la región del Petén.",
  },
  {
    id: "g2",
    slug: "guatemala-quiche",
    nombre: "Yacimiento (Quiché)",
    latitud: 15.015,
    longitud: -91.1487,
    pais: "Guatemala",
    provincia: "Quiché",
    canton: "Santa Cruz del Quiché",
    resumen: "Segundo registro en Guatemala.",
    descripcion:
      "Registro georreferenciado para consulta por país y provincia.",
  },
];

export function getMapFossilById(id: string): MapFossilPoint | undefined {
  return MAP_FOSSIL_POINTS.find((p) => p.id === id);
}

export function cantonesEnMapa(points: MapFossilPoint[] = MAP_FOSSIL_POINTS): string[] {
  const set = new Set(
    points
      .map((p) => (p.canton || p.provincia || "").trim())
      .filter((s) => s.length > 0),
  );
  return [...set].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}
