import type { ApiFosilRow, CatalogoImagenRow } from "./api";
import { multimediaAbsUrl } from "./api";

const PLACEHOLDER_IMAGES = [
  "/catalogo-imagenes/amonita.svg",
  "/catalogo-imagenes/trilobite.svg",
  "/catalogo-imagenes/megalodon.svg",
  "/catalogo-imagenes/helecho.svg",
  "/catalogo-imagenes/dinosaurio.svg",
  "/catalogo-imagenes/corales.svg",
] as const;

const CATEGORIA_LABEL: Record<number, string> = {
  1: "Fósil general",
  2: "Mineral",
  3: "Roca",
  4: "Paleontológico",
};

const CATEGORIA_BADGE: Record<number, string> = {
  1: "FOS",
  2: "MIN",
  3: "ROC",
  4: "PAL",
};

const LABEL_BY_BADGE: Record<string, string> = {
  FOS: "Fósil general",
  MIN: "Mineral",
  ROC: "Roca",
  PAL: "Paleontológico",
};

export function categoryLabel(categoria_id?: number): string {
  if (categoria_id == null) return "Colección";
  return CATEGORIA_LABEL[categoria_id] ?? `Categoría ${categoria_id}`;
}

/** Título corto de catálogo: nombre común explícito, o legado `nombre`. */
export function tituloPublicoFosil(row: {
  nombre: string;
  nombre_comun?: string | null;
}): string {
  const c = row.nombre_comun?.trim();
  if (c) return c;
  return row.nombre?.trim() || "";
}

export function placeholderImageForId(id: number): string {
  const i = Math.abs(id) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[i];
}

export function fosilCardFromApi(row: ApiFosilRow, index: number) {
  const desc = row.descripcion_general?.trim();
  const short =
    desc && desc.length > 160 ? `${desc.slice(0, 157)}…` : desc || undefined;
  const portada =
    typeof row.portada_url === "string" && row.portada_url.length > 0
      ? multimediaAbsUrl(row.portada_url)
      : null;
  const badgeFromCode = row.categoria_codigo?.trim().toUpperCase();
  const badgeFromId = row.categoria_id ? CATEGORIA_BADGE[row.categoria_id] : undefined;
  const badgeFromUnique = row.codigo_unico?.split("-")?.[3]?.trim().toUpperCase();
  const categoryBadge =
    badgeFromCode ||
    badgeFromId ||
    (badgeFromUnique && LABEL_BY_BADGE[badgeFromUnique] ? badgeFromUnique : undefined) ||
    "FOS";
  const resolvedCategoryLabel =
    row.categoria_nombre ||
    categoryLabel(row.categoria_id) ||
    LABEL_BY_BADGE[categoryBadge] ||
    "Colección";
  return {
    id: String(row.id),
    name: tituloPublicoFosil(row),
    category: resolvedCategoryLabel,
    categoryBadge,
    eraLabel: row.era_nombre || "Era no disponible",
    imageSrc: portada ?? placeholderImageForId(row.id + index),
    fallbackSrc: placeholderImageForId(row.id + index),
    description: short,
    fichaHref: `/fosil/${row.id}`,
  };
}

/** Catálogo por imagen: nombre común/científico en BD (sin concatenar archivo). */
export function catalogImageCardFromApi(row: CatalogoImagenRow, index: number) {
  const desc = row.descripcion_general?.trim() || "";
  const short = desc && desc.length > 160 ? `${desc.slice(0, 157)}…` : desc || undefined;
  const imageSrc =
    typeof row.imagen_url === "string" && row.imagen_url.length > 0
      ? multimediaAbsUrl(row.imagen_url)
      : placeholderImageForId(row.id + index);
  const badgeFromCode = row.categoria_codigo?.trim().toUpperCase();
  const badgeFromId = row.categoria_id ? CATEGORIA_BADGE[row.categoria_id] : undefined;
  const badgeFromUnique = row.codigo_unico?.split("-")?.[3]?.trim().toUpperCase();
  const categoryBadge =
    badgeFromCode ||
    badgeFromId ||
    (badgeFromUnique && LABEL_BY_BADGE[badgeFromUnique] ? badgeFromUnique : undefined) ||
    "FOS";
  const resolvedCategoryLabel =
    row.categoria_nombre ||
    (row.categoria_id ? categoryLabel(row.categoria_id) : null) ||
    LABEL_BY_BADGE[categoryBadge] ||
    "Colección";
  const name = tituloPublicoFosil(row);
  const scientificName = row.nombre_cientifico?.trim() || undefined;
  const ubicacion = row.ubicacion?.trim() || undefined;
  const encontradoPor = row.explorador_publico?.trim() || undefined;

  return {
    id: `${row.id}-${row.multimedia_id}`,
    name,
    scientificName,
    ubicacion,
    encontradoPor,
    category: resolvedCategoryLabel,
    categoryBadge,
    eraLabel: row.era_nombre || "Era no disponible",
    imageSrc,
    fallbackSrc: placeholderImageForId(row.id + index),
    description: short,
    fichaHref: row.id > 0 ? `/fosil/${row.id}` : undefined,
  };
}
