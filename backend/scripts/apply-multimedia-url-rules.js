/* eslint-disable no-console */
/**
 * 1) Corrige categorías FOSIL (PAL/MIN/ROC) como en migración 100.
 * 2) Actualiza MULTIMEDIA.url a /images/fossiles/<carpeta>/<archivo> según reglas y
 *    carpetas reales (minerales ↔ mineralizados, excavaciones ↔ paleontologico-especifico).
 * 3) Verifica archivos en disco; si un fósil publicado no tiene portada válida, intenta
 *    asociar la imagen del disco con mayor similitud al nombre científico/común.
 *
 *   cd backend && node scripts/apply-multimedia-url-rules.js --dry-run
 *   cd backend && npm run apply:media-rules
 *   cd backend && npm run verify:fossil-media
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool, poolConnect } = require("../src/config/db");
const { diskPathFromPublicUrl } = require("../src/config/paths");

const ROOT = path.join(__dirname, "..", "images", "fossiles");

const CATEGORY_FIXES = [
  `UPDATE f SET categoria_id = 4 FROM dbo.FOSIL f
   WHERE f.deleted_at IS NULL AND f.categoria_id = 1 AND (
     f.nombre LIKE N'%Amonite%' OR f.nombre LIKE N'%amonite%' OR f.nombre LIKE N'%Trilobite%' OR f.nombre LIKE N'%trilobit%'
     OR f.nombre LIKE N'%Helecho%' OR f.nombre LIKE N'%Hoja Fosil%' OR f.nombre LIKE N'%Hoja fósil%' OR f.nombre LIKE N'%Coral%'
     OR f.nombre LIKE N'%Mosasaurio%' OR f.nombre LIKE N'%mosasaurio%' OR f.nombre LIKE N'%Cetaceo%' OR f.nombre LIKE N'%cetáceo%'
     OR f.nombre LIKE N'%Mastodonte%' OR f.nombre LIKE N'%mastodonte%' OR f.nombre LIKE N'%Equinodermo%' OR f.nombre LIKE N'%equinodermo%'
     OR f.nombre LIKE N'%crocodiliano%' OR f.nombre LIKE N'%Crocodil%' OR f.nombre LIKE N'%Megafauna%' OR f.nombre LIKE N'%megafauna%'
     OR f.nombre LIKE N'%Diente de%' OR f.nombre LIKE N'%pez%' OR f.nombre LIKE N'%Pez%' OR f.nombre LIKE N'%planta%' OR f.nombre LIKE N'%Planta%'
   )`,
  `UPDATE f SET categoria_id = 2 FROM dbo.FOSIL f
   WHERE f.deleted_at IS NULL AND f.categoria_id = 1 AND (
     f.nombre LIKE N'%Pirita%' OR f.nombre LIKE N'%pirita%' OR f.nombre LIKE N'%Calcopirita%' OR f.nombre LIKE N'%calcopirita%'
     OR f.nombre LIKE N'%Cuarzo%' OR f.nombre LIKE N'%cuarzo%' OR f.nombre LIKE N'%Magnetita%' OR f.nombre LIKE N'%magnetita%'
   )`,
  `UPDATE f SET categoria_id = 3 FROM dbo.FOSIL f
   WHERE f.deleted_at IS NULL AND f.categoria_id = 1 AND (
     f.nombre LIKE N'%Caliza%' OR f.nombre LIKE N'%caliza%' OR f.nombre LIKE N'%Basalto%' OR f.nombre LIKE N'%basalto%'
   )`,
];

function listDirs() {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function resolveNameInDir(absDir, wantName) {
  if (!wantName || !fs.existsSync(absDir)) return null;
  const name = String(wantName).trim();
  const direct = path.join(absDir, name);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return name;
  const lower = name.toLowerCase();
  const files = fs.readdirSync(absDir);
  const hit = files.find((f) => f.toLowerCase() === lower);
  if (hit && fs.statSync(path.join(absDir, hit)).isFile()) return hit;
  return null;
}

function findUrlForFile(nombreArchivo, folderOrder) {
  for (const folder of folderOrder) {
    const absDir = path.join(ROOT, folder);
    const resolved = resolveNameInDir(absDir, nombreArchivo);
    if (resolved) return `/images/fossiles/${folder}/${resolved}`;
  }
  return null;
}

/** Orden de carpetas según reglas de negocio (se prueba en orden hasta que exista el archivo). */
function folderOrderForRow(row, fosil) {
  const n = (row.nombre_archivo || "").toLowerCase();
  const c = fosil ? fosil.categoria_id : null;

  const excav =
    /excavacion|excavación|excavacion_|herramientas|_equipo|_sitio|vertebras|campo\.jpg/.test(n) ||
    row.subtipo === "antes";

  if (excav) {
    return ["excavaciones", "paleontologico-especifico", "generales", "mineralizados", "rocas", "minerales"];
  }

  if (c === 2) {
    return ["minerales", "mineralizados", "rocas", "generales", "paleontologico-especifico"];
  }
  if (c === 3) {
    return ["rocas", "mineralizados", "generales", "paleontologico-especifico", "minerales"];
  }

  if (
    /ammonite|ammono|trilobit|cleoniceras|perisphinctes|elrathia|cryptolithus|pecten|diplomystus|pez_fosil|bivalvo|molde_interno|iguandon|grupo_roca|crinoid|hippocampus_fosil|colonia_fosil/.test(
      n,
    )
  ) {
    return ["generales", "mineralizados", "rocas", "paleontologico-especifico", "excavaciones", "minerales"];
  }

  if (
    /tyrannosaurus|stegosaurus|psittacosaurus|ichthyosaurus|diplodocus|irritator|sinornithosaurus|theropoda|sauropodo|neuropteris|pecopteris|zamites|protorosaurus|smilodon|scipionyx|fossil_arena|dinosaurio|reptil_fosil/.test(
      n,
    )
  ) {
    return ["paleontologico-especifico", "generales", "mineralizados", "rocas", "excavaciones", "minerales"];
  }

  return [
    "paleontologico-especifico",
    "generales",
    "mineralizados",
    "rocas",
    "excavaciones",
    "minerales",
  ];
}

function collectAllImageEntries() {
  const out = [];
  for (const folder of listDirs()) {
    const absDir = path.join(ROOT, folder);
    for (const file of fs.readdirSync(absDir)) {
      const ext = path.extname(file).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"].includes(ext)) continue;
      const abs = path.join(absDir, file);
      if (!fs.statSync(abs).isFile()) continue;
      out.push({ folder, file, url: `/images/fossiles/${folder}/${file}` });
    }
  }
  return out;
}

function tokenize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function scoreFosilVsFile(fosil, fileBase) {
  const parts = [fosil.nombre_cientifico, fosil.nombre_comun, fosil.nombre].filter(Boolean).join(" ");
  const tokens = tokenize(parts);
  const fb = fileBase.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/_/g, " ");
  let score = 0;
  for (const t of tokens) {
    if (t.length < 4) continue;
    if (fb.includes(t) || t.includes(fb.slice(0, Math.min(8, fb.length)))) score += 3;
  }
  const genus = tokenize(fosil.nombre_cientifico || "")[0];
  if (genus && fb.includes(genus)) score += 8;
  return score;
}

async function runCategoryFixes(dryRun) {
  if (dryRun) {
    console.log("(dry-run) se omiten UPDATE de categoría FOSIL.");
    return;
  }
  for (const sql of CATEGORY_FIXES) {
    await pool.request().query(sql);
  }
}

async function applyUrlRules(dryRun) {
  const fosilesR = await pool.request().query(`
    SELECT id, categoria_id, nombre, nombre_comun, nombre_cientifico
    FROM dbo.FOSIL WHERE deleted_at IS NULL
  `);
  const fosilById = new Map((fosilesR.recordset || []).map((f) => [f.id, f]));

  const mediaR = await pool.request().query(`
    SELECT m.id, m.fosil_id, m.url, m.nombre_archivo, m.subtipo, m.tipo
    FROM dbo.MULTIMEDIA m
    WHERE m.deleted_at IS NULL AND m.tipo = N'imagen'
    ORDER BY m.id
  `);
  const rows = mediaR.recordset || [];
  let updated = 0;
  let unchanged = 0;
  let missing = 0;

  for (const row of rows) {
    const fosil = fosilById.get(row.fosil_id);
    const order = folderOrderForRow(row, fosil);
    const resolved = row.nombre_archivo ? findUrlForFile(row.nombre_archivo, order) : null;
    if (!resolved) {
      missing += 1;
      console.warn(`[sin archivo] multimedia id=${row.id} fosil=${row.fosil_id} archivo=${row.nombre_archivo}`);
      continue;
    }
    const cur = String(row.url || "").replace(/\\/g, "/");
    if (cur === resolved) {
      unchanged += 1;
      continue;
    }
    if (!dryRun) {
      await pool
        .request()
        .input("id", row.id)
        .input("url", resolved)
        .query(`UPDATE dbo.MULTIMEDIA SET url = @url WHERE id = @id AND deleted_at IS NULL`);
    }
    updated += 1;
  }
  return { updated, unchanged, missing, total: rows.length };
}

async function verifyDisk() {
  const r = await pool.request().query(`
    SELECT m.id, m.fosil_id, m.url, m.nombre_archivo
    FROM dbo.MULTIMEDIA m
    WHERE m.deleted_at IS NULL AND m.tipo = N'imagen'
  `);
  const bad = [];
  for (const row of r.recordset || []) {
    const disk = diskPathFromPublicUrl(row.url);
    if (!disk || !fs.existsSync(disk)) bad.push(row);
  }
  return bad;
}

function formatoFromFile(fname) {
  const e = path.extname(fname).replace(".", "").toLowerCase();
  return e === "jpg" ? "jpeg" : e || "jpeg";
}

async function ensurePortadas(dryRun) {
  const allImages = collectAllImageEntries();
  const published = await pool.request().query(`
    SELECT f.id, f.nombre, f.nombre_comun, f.nombre_cientifico
    FROM dbo.FOSIL f
    WHERE f.deleted_at IS NULL AND f.estado = N'publicado'
  `);

  let patched = 0;
  for (const fosil of published.recordset || []) {
    const imgs = await pool.request().input("fid", fosil.id).query(`
      SELECT id, url, nombre_archivo, es_principal
      FROM dbo.MULTIMEDIA
      WHERE fosil_id = @fid AND deleted_at IS NULL AND tipo = N'imagen'
      ORDER BY es_principal DESC, orden ASC, id ASC
    `);
    const list = imgs.recordset || [];
    let hasValid = false;
    for (const im of list) {
      const d = diskPathFromPublicUrl(im.url);
      if (d && fs.existsSync(d)) {
        hasValid = true;
        break;
      }
    }
    if (hasValid) continue;

    let best = null;
    let bestScore = -1;
    for (const e of allImages) {
      const sc = scoreFosilVsFile(fosil, e.file);
      if (sc > bestScore) {
        bestScore = sc;
        best = e;
      }
    }
    if (!best || bestScore < 4) {
      console.warn(`[fósil sin imagen] id=${fosil.id} ${fosil.nombre} — no hubo candidato claro en disco (mejor score=${bestScore})`);
      continue;
    }
    if (dryRun) {
      console.log(
        `[dry-run] fósil ${fosil.id} sin portada válida → sugerido ${best.url} (score ${bestScore})`,
      );
      patched += 1;
      continue;
    }
    const ordR = await pool.request().input("fid", fosil.id).query(`
      SELECT ISNULL(MAX(orden), 0) AS mx FROM dbo.MULTIMEDIA WHERE fosil_id = @fid AND deleted_at IS NULL
    `);
    const orden = (ordR.recordset[0]?.mx ?? 0) + 1;
    await pool
      .request()
      .input("fosil_id", fosil.id)
      .input("url", best.url)
      .input("nombre_archivo", best.file)
      .input("formato", formatoFromFile(best.file))
      .input("orden", orden)
      .query(`
        INSERT INTO dbo.MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
        VALUES (@fosil_id, N'imagen', N'portada', @url, @nombre_archivo, @formato, NULL, 1, @orden)
      `);
    patched += 1;
  }
  return patched;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const verifyOnly = process.argv.includes("--verify-only");
  await poolConnect;

  if (!fs.existsSync(ROOT)) {
    console.error(`No existe ${ROOT}. Creá la carpeta o cloná las imágenes del repo.`);
    process.exitCode = 1;
    return;
  }

  if (!verifyOnly) {
    console.log("Aplicando correcciones de categoría FOSIL…");
    await runCategoryFixes(dryRun);
    console.log("Aplicando reglas de rutas MULTIMEDIA…");
    const u = await applyUrlRules(dryRun);
    console.log(JSON.stringify({ ...u, dry_run: dryRun }, null, 2));
    if (!dryRun) {
      const p = await ensurePortadas(false);
      console.log(JSON.stringify({ portadas_insertadas: p }, null, 2));
    } else {
      console.log(
        "(dry-run) no se insertan portadas suplentes; sin --dry-run se rellenan fósiles publicados sin archivo válido.",
      );
    }
  }

  const bad = await verifyDisk();
  console.log(
    JSON.stringify(
      {
        verify_multimedia_rows_sin_archivo: bad.length,
        muestra: bad.slice(0, 15).map((b) => ({ id: b.id, fosil_id: b.fosil_id, url: b.url })),
      },
      null,
      2,
    ),
  );
  if (bad.length) process.exitCode = 2;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.close();
    } catch {
      /* ignore */
    }
  });
