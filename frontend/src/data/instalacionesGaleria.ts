import fs from "node:fs";
import path from "node:path";
import { placeholderImageForId } from "@/lib/fosilesDisplay";

const ROOT_DIR = path.join(process.cwd(), "public", "images", "instalaciones");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

export type ItemGaleriaInstalacion = {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion?: string;
  href: string;
  imageSrc: string;
  fallbackSrc: string;
};

function humanize(text: string): string {
  return text
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectFiles(dir: string, baseRel = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = baseRel ? `${baseRel}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(abs, rel));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMG_EXT.has(ext)) continue;
    out.push(rel);
  }
  return out;
}

export function itemsGaleriaInstalaciones(): ItemGaleriaInstalacion[] {
  const files = collectFiles(ROOT_DIR).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  return files.map((rel, i) => {
    const folder = rel.includes("/") ? rel.split("/")[0] : "instalaciones";
    const filename = path.basename(rel, path.extname(rel));
    return {
      id: `inst-${i + 1}`,
      titulo: humanize(filename),
      subtitulo: humanize(folder),
      descripcion: `Vista de ${humanize(folder)} en el Stonewake Museum.`,
      href: "/galeria",
      imageSrc: encodeURI(`/images/instalaciones/${rel}`),
      fallbackSrc: placeholderImageForId(i + 1),
    };
  });
}
