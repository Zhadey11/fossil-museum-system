import type { ApiFosilRow } from "./api";
import { multimediaAbsUrl } from "./api";

/** Nombres de archivo en `backend/images/instalaciones/` (servidos como `/images/instalaciones/...`). */
function galeriaInstalacionesFiles(): string[] {
  const raw = process.env.NEXT_PUBLIC_GALERIA_INSTALACIONES?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (raw && raw.length > 0) return raw;
  return [
    "galeria-01.jpg",
    "galeria-02.jpg",
    "galeria-03.jpg",
    "galeria-04.jpg",
    "galeria-05.jpg",
    "galeria-06.jpg",
  ];
}

/**
 * Imagen de sala/instalación. Usa ruta relativa proxied por Next (`/__api-images/...` → API `/images/...`)
 * para que funcione al abrir el front por IP de red (el navegador no debe pedir a `localhost:4000`).
 */
export function instalacionGaleriaUrl(index: number): string {
  const files = galeriaInstalacionesFiles();
  const name = files[Math.abs(index) % files.length];
  const safe = encodeURIComponent(name);
  return `/__api-images/instalaciones/${safe}`;
}

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
