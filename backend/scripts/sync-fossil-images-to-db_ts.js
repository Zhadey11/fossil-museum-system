const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool, poolConnect } = require("../src/config/db");

const ROOT = path.join(__dirname, "..", "images", "fossiles");
const EXT_OK = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);
/*
 * Carpetas físicas → categoria_id de FOSIL (05_datos_prueba.sql):
 * 1 FOS, 2 MIN, 3 ROC, 4 PAL.
 * "mineralizados" aloja fósiles petrificados (amonitas, trilobites), no minerales sueltos → PAL.
 */
const CAT_BY_FOLDER = {
  generales: 1,
  mineralizados: 4,
  minerales: 2,
  rocas: 3,
  "paleontologico-especifico": 4,
  excavaciones: 4,
};

function normalizeExt(ext) {
  const e = ext.replace(".", "").toLowerCase();
  return e === "jpg" ? "jpeg" : e;
}

function pickSubtipo(name) {
  const n = name.toLowerCase();
  if (n.includes("excavacion") || n.includes("excavación")) return "antes";
  if (n.includes("antes")) return "antes";
  if (n.includes("despues") || n.includes("después")) return "despues";
  if (n.includes("analisis") || n.includes("análisis")) return "analisis";
  if (n.includes("portada")) return "portada";
  return "general";
}

function collectFiles() {
  const out = [];
  if (!fs.existsSync(ROOT)) return out;
  for (const dir of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const catId = CAT_BY_FOLDER[dir.name];
    if (!catId) continue;
    const absDir = path.join(ROOT, dir.name);
    for (const fname of fs.readdirSync(absDir)) {
      const ext = path.extname(fname).toLowerCase();
      if (!EXT_OK.has(ext)) continue;
      const abs = path.join(absDir, fname);
      const st = fs.statSync(abs);
      out.push({
        folder: dir.name,
        categoria_id: catId,
        nombre_archivo: fname,
        url: `/images/fossiles/${dir.name}/${fname}`,
        formato: normalizeExt(ext),
        tamano_bytes: st.size,
        subtipo: pickSubtipo(fname),
      });
    }
  }
  return out;
}

async function getExistingUrls() {
  const r = await pool.request().query(`
    SELECT LOWER(url) AS url
    FROM MULTIMEDIA
    WHERE deleted_at IS NULL
      AND tipo = 'imagen'
      AND url LIKE '/images/fossiles/%'
  `);
  return new Set((r.recordset || []).map((x) => x.url));
}

async function getPublishedFossilsByCategory() {
  const r = await pool.request().query(`
    SELECT id, categoria_id
    FROM FOSIL
    WHERE deleted_at IS NULL
      AND estado = 'publicado'
      AND categoria_id IN (1,2,3,4)
    ORDER BY id ASC
  `);
  const map = new Map();
  for (const row of r.recordset || []) {
    if (!map.has(row.categoria_id)) map.set(row.categoria_id, []);
    map.get(row.categoria_id).push(row.id);
  }
  return map;
}

async function getImageCountPerFossil() {
  const r = await pool.request().query(`
    SELECT fosil_id, COUNT(*) AS n
    FROM MULTIMEDIA
    WHERE deleted_at IS NULL
      AND tipo = 'imagen'
    GROUP BY fosil_id
  `);
  const counts = new Map();
  for (const row of r.recordset || []) counts.set(row.fosil_id, row.n);
  return counts;
}

function pickFossilId(catId, fossilsByCat, counts) {
  const list = fossilsByCat.get(catId) || [];
  if (list.length === 0) return null;
  let best = list[0];
  let bestCount = counts.get(best) || 0;
  for (const id of list) {
    const c = counts.get(id) || 0;
    if (c < bestCount) {
      best = id;
      bestCount = c;
    }
  }
  counts.set(best, bestCount + 1);
  return best;
}

async function insertRow(file, fosil_id) {
  const req = pool.request();
  req.input("fosil_id", fosil_id);
  req.input("tipo", "imagen");
  req.input("subtipo", file.subtipo);
  req.input("url", file.url);
  req.input("nombre_archivo", file.nombre_archivo);
  req.input("formato", file.formato);
  req.input("descripcion", null);
  req.input("angulo", null);
  req.input("es_principal", 0);
  req.input("orden", 0);
  req.input("tamano_bytes", file.tamano_bytes);
  await req.query(`
    INSERT INTO MULTIMEDIA (
      fosil_id, tipo, subtipo, url, nombre_archivo, formato,
      descripcion, angulo, es_principal, orden, tamano_bytes
    ) VALUES (
      @fosil_id, @tipo, @subtipo, @url, @nombre_archivo, @formato,
      @descripcion, @angulo, @es_principal, @orden, @tamano_bytes
    )
  `);
}

async function main() {
  await poolConnect;
  const files = collectFiles();
  const existing = await getExistingUrls();
  const fossilsByCat = await getPublishedFossilsByCategory();
  const counts = await getImageCountPerFossil();

  const missing = files.filter((f) => !existing.has(f.url.toLowerCase()));
  let inserted = 0;
  let skipped = 0;

  for (const file of missing) {
    const fosil_id = pickFossilId(file.categoria_id, fossilsByCat, counts);
    if (!fosil_id) {
      skipped += 1;
      continue;
    }
    await insertRow(file, fosil_id);
    inserted += 1;
  }

  console.log(
    JSON.stringify(
      {
        total_files: files.length,
        already_registered: files.length - missing.length,
        inserted,
        skipped_no_fossil_for_category: skipped,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error("[sync-fossil-images-to-db] error:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.close();
    } catch {
      /* ignore */
    }
  });
