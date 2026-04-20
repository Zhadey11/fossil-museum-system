/**
 * Datos demo para el mapa de hallazgos (lat/lng).
 * En producción vendrán de FOSIL + CANTON/PROVINCIA/PAIS (backend).
 */
export type MapFossilPoint = {
  id: string;
  /** Coincide con futuro FOSIL.slug */
  slug: string;
  nombre: string;
  latitud: number;
  longitud: number;
  pais: string;
  provincia: string;
  /** Texto corto para popup */
  resumen: string;
  /** Texto largo para ficha */
  descripcion: string;
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
    resumen: "Cretácico marino — lutitas del Valle de Turrialba.",
    descripcion:
      "Diente cónico bien preservado de mosasaurio. Hallado en afloramientos de lutita calcárea del Cretácico Superior. Coordenadas aproximadas de campo; la ficha completa incluirá fotos, estudios y referencias cuando exista API.",
  },
  {
    id: "m2",
    slug: "cetaceo-talamanca",
    nombre: "Vértebra de cetáceo (Talamanca)",
    latitud: 9.5667,
    longitud: -82.85,
    pais: "Costa Rica",
    provincia: "Limón",
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
    resumen: "Jurásico medio — fronde en lutita carbonosa.",
    descripcion:
      "Impresión de fronde arborescente; indicadores paleoclimáticos descritos en el estudio asociado.",
  },
  {
    id: "g1",
    slug: "demo-guatemala-peten",
    nombre: "Muestra paleontológica (demo Petén)",
    latitud: 16.9186,
    longitud: -89.9022,
    pais: "Guatemala",
    provincia: "Petén",
    resumen: "Demo: punto en Guatemala para probar filtro por país.",
    descripcion:
      "Coordenadas de referencia cerca de la región del Petén. En producción este registro vendría de la misma base que Costa Rica, con jerarquía país → provincia → cantón.",
  },
  {
    id: "g2",
    slug: "demo-guatemala-quiche",
    nombre: "Yacimiento demo (Quiché)",
    latitud: 15.015,
    longitud: -91.1487,
    pais: "Guatemala",
    provincia: "Quiché",
    resumen: "Demo: segundo hallazgo en Guatemala.",
    descripcion:
      "Ejemplo de cómo el mapa puede mostrar solo pins de un país al filtrar. La ficha completa enlazará con multimedia y estudios.",
  },
];

export function getMapFossilById(id: string): MapFossilPoint | undefined {
  return MAP_FOSSIL_POINTS.find((p) => p.id === id);
}

export function paisesEnMapa(points: MapFossilPoint[] = MAP_FOSSIL_POINTS): string[] {
  return [...new Set(points.map((p) => p.pais))].sort();
}

export function provinciasPorPais(
  points: MapFossilPoint[],
  pais: string | null,
): string[] {
  if (!pais) return [];
  const set = new Set(
    points.filter((p) => p.pais === pais).map((p) => p.provincia),
  );
  return [...set].sort();
}
