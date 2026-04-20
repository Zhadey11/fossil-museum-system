import { instalacionGaleriaUrl } from "@/lib/fosilesDisplay";

/** Salas y espacios del edificio (fotos en `backend/images/instalaciones/`), no piezas de colección. */
export type ItemGaleriaInstalacion = {
  id: string;
  /** Título de la sala o espacio. */
  titulo: string;
  /** Línea secundaria (p. ej. piso o tipo de sala). */
  subtitulo: string;
  descripcion?: string;
  href: string;
  imageSrc: string;
};

const BASE: Omit<ItemGaleriaInstalacion, "imageSrc">[] = [
  {
    id: "i1",
    titulo: "Vestíbulo y bienvenida",
    subtitulo: "Planta baja",
    descripcion:
      "Punto de partida del recorrido: mapas, orientación y primera mirada al museo.",
    href: "/historia",
  },
  {
    id: "i2",
    titulo: "Galería I — Orígenes",
    subtitulo: "Colección permanente",
    descripcion: "Primeras formas de vida y ambientes antiguos en vitrinas curadas.",
    href: "/historia",
  },
  {
    id: "i3",
    titulo: "Sala de minerales",
    subtitulo: "Geología viva",
    href: "/catalogo",
  },
  {
    id: "i4",
    titulo: "Pasillo de grandes fósiles",
    subtitulo: "Piezas monumentales",
    descripcion: "Restos a tamaño natural y contextos de excavación.",
    href: "/catalogo",
  },
  {
    id: "i5",
    titulo: "Laboratorio a la vista",
    subtitulo: "Conservación",
    descripcion: "Donde el equipo prepara y documenta material para exposición e investigación.",
    href: "/historia",
  },
  {
    id: "i6",
    titulo: "Sala educativa",
    subtitulo: "Talleres y visitas",
    href: "/historia",
  },
];

export function itemsGaleriaInstalaciones(): ItemGaleriaInstalacion[] {
  return BASE.map((row, i) => ({
    ...row,
    imageSrc: instalacionGaleriaUrl(i),
  }));
}
