/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool, poolConnect } = require("../src/config/db");
const { diskPathFromPublicUrl } = require("../src/config/paths");

async function q(sql) {
  const r = await pool.request().query(sql);
  return r.recordset || [];
}

function extractIdFromFilename(nombreArchivo = "", url = "") {
  const s = `${nombreArchivo} ${url}`;
  const m = s.match(/fosil_(\d+)_/i);
  return m ? Number(m[1]) : null;
}

async function main() {
  await poolConnect;
  const fossils = await q(`
    SELECT id, nombre, estado
    FROM FOSIL
    WHERE deleted_at IS NULL
  `);
  const media = await q(`
    SELECT id, fosil_id, tipo, subtipo, nombre_archivo, descripcion, url, es_principal, orden
    FROM MULTIMEDIA
    WHERE deleted_at IS NULL
    ORDER BY fosil_id, es_principal DESC, orden ASC, id ASC
  `);

  const byFossil = new Map();
  for (const m of media) {
    if (!byFossil.has(m.fosil_id)) byFossil.set(m.fosil_id, []);
    byFossil.get(m.fosil_id).push(m);
  }

  const mismatchedFilenameId = [];
  const missingFiles = [];
  for (const m of media) {
    const fromName = extractIdFromFilename(m.nombre_archivo, m.url);
    if (fromName != null && fromName !== Number(m.fosil_id)) {
      mismatchedFilenameId.push({
        multimedia_id: m.id,
        fosil_id_db: m.fosil_id,
        fosil_id_nombre: fromName,
        nombre_archivo: m.nombre_archivo,
        url: m.url,
      });
    }
    if (typeof m.url === "string" && (m.url.startsWith("/images/") || m.url.startsWith("/videos/"))) {
      const diskPath = diskPathFromPublicUrl(m.url);
      if (diskPath && !fs.existsSync(diskPath)) {
        missingFiles.push({
          multimedia_id: m.id,
          fosil_id: m.fosil_id,
          url: m.url,
          expected_path: diskPath,
        });
      }
    }
  }

  const multiMain = [];
  const noMain = [];
  const noImage = [];
  for (const f of fossils) {
    const rows = byFossil.get(f.id) || [];
    const principals = rows.filter((r) => Number(r.es_principal) === 1);
    const images = rows.filter((r) => String(r.tipo).toLowerCase() === "imagen");
    if (principals.length > 1) {
      multiMain.push({
        fosil_id: f.id,
        nombre: f.nombre,
        principales: principals.map((p) => p.id),
      });
    }
    if (rows.length > 0 && principals.length === 0) {
      noMain.push({
        fosil_id: f.id,
        nombre: f.nombre,
        multimedia_count: rows.length,
      });
    }
    if (rows.length > 0 && images.length === 0) {
      noImage.push({
        fosil_id: f.id,
        nombre: f.nombre,
        multimedia_count: rows.length,
      });
    }
  }

  const dupName = await q(`
    SELECT nombre_archivo, COUNT(*) AS cantidad, COUNT(DISTINCT fosil_id) AS fosiles
    FROM MULTIMEDIA
    WHERE deleted_at IS NULL
      AND nombre_archivo IS NOT NULL
      AND LTRIM(RTRIM(nombre_archivo)) <> ''
    GROUP BY nombre_archivo
    HAVING COUNT(DISTINCT fosil_id) > 1
    ORDER BY COUNT(DISTINCT fosil_id) DESC, COUNT(*) DESC
  `);

  const dupDescription = await q(`
    SELECT descripcion, COUNT(*) AS cantidad, COUNT(DISTINCT fosil_id) AS fosiles
    FROM MULTIMEDIA
    WHERE deleted_at IS NULL
      AND descripcion IS NOT NULL
      AND LTRIM(RTRIM(descripcion)) <> ''
    GROUP BY descripcion
    HAVING COUNT(DISTINCT fosil_id) > 1 AND COUNT(*) >= 3
    ORDER BY COUNT(DISTINCT fosil_id) DESC, COUNT(*) DESC
  `);

  console.log("\n=== Audit: Fossil ↔ Multimedia consistency ===");
  console.log(`Fósiles activos: ${fossils.length}`);
  console.log(`Multimedia activa: ${media.length}`);
  console.log(`Fósiles con 2+ portadas: ${multiMain.length}`);
  console.log(`Fósiles con multimedia pero sin portada: ${noMain.length}`);
  console.log(`Fósiles con multimedia pero sin imágenes: ${noImage.length}`);
  console.log(`Nombre de archivo repetido entre fósiles: ${dupName.length}`);
  console.log(`Descripción repetida entre fósiles (>=3): ${dupDescription.length}`);
  console.log(`ID en nombre/url != fosil_id en DB: ${mismatchedFilenameId.length}`);
  console.log(`Rutas con archivo físico faltante: ${missingFiles.length}`);

  if (multiMain.length) console.log("\n--- Doble portada (muestra) ---\n", multiMain.slice(0, 20));
  if (noMain.length) console.log("\n--- Sin portada marcada (muestra) ---\n", noMain.slice(0, 20));
  if (noImage.length) console.log("\n--- Sin imagen (solo videos/u otros) ---\n", noImage.slice(0, 20));
  if (dupName.length) console.log("\n--- nombre_archivo duplicado entre fósiles ---\n", dupName.slice(0, 20));
  if (dupDescription.length) console.log("\n--- descripcion duplicada entre fósiles ---\n", dupDescription.slice(0, 20));
  if (mismatchedFilenameId.length) console.log("\n--- ID inconsistente en nombre/url ---\n", mismatchedFilenameId.slice(0, 20));
  if (missingFiles.length) console.log("\n--- Archivo físico faltante ---\n", missingFiles.slice(0, 20));

  if (
    multiMain.length ||
    noMain.length ||
    noImage.length ||
    dupName.length ||
    dupDescription.length ||
    mismatchedFilenameId.length ||
    missingFiles.length
  ) {
    process.exitCode = 2;
  }
}

main()
  .catch((err) => {
    console.error("[audit-fossil-media-consistency] error:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.close();
    } catch {
      /* ignore */
    }
  });
