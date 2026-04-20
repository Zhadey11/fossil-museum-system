import type { ApiFosilRow } from "./api";
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

export function categoryLabel(categoria_id?: number): string {
  if (categoria_id == null) return "Colección";
  return CATEGORIA_LABEL[categoria_id] ?? `Categoría ${categoria_id}`;
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
  return {
    id: String(row.id),
    name: row.nombre,
    category: categoryLabel(row.categoria_id),
    imageSrc: portada ?? placeholderImageForId(row.id + index),
    description: short,
    fichaHref: `/fosil/${row.id}`,
  };
}
