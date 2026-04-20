/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool, poolConnect } = require("../src/config/db");

const BACKEND_ROOT = path.join(__dirname, "..");

function toDiskPath(urlPath) {
  if (typeof urlPath !== "string") return null;
  if (!urlPath.startsWith("/images/") && !urlPath.startsWith("/videos/")) return null;
  const relative = urlPath.replace(/^\//, "").split("/").join(path.sep);
  return path.join(BACKEND_ROOT, relative);
}

async function fetchMediaRows() {
  const result = await pool.request().query(`
    SELECT id, url, tipo
    FROM MULTIMEDIA
    WHERE deleted_at IS NULL
      AND url IS NOT NULL
      AND (url LIKE '/images/%' OR url LIKE '/videos/%')
    ORDER BY id ASC
  `);
  return result.recordset || [];
}

async function main() {
  await poolConnect;
  const rows = await fetchMediaRows();
  const missing = [];
  let ok = 0;

  for (const row of rows) {
    const diskPath = toDiskPath(row.url);
    if (!diskPath) continue;
    if (fs.existsSync(diskPath)) {
      ok += 1;
      continue;
    }
    missing.push({
      id: row.id,
      tipo: row.tipo,
      url: row.url,
      expected_path: diskPath,
    });
  }

  console.log("\n=== Multimedia Files Check ===");
  console.log(`Total revisados: ${rows.length}`);
  console.log(`Encontrados en disco: ${ok}`);
  console.log(`Faltantes: ${missing.length}`);

  if (missing.length > 0) {
    console.log("\n--- Archivos faltantes ---");
    for (const m of missing) {
      console.log(
        `[id=${m.id}] tipo=${m.tipo} url=${m.url} -> expected=${m.expected_path}`,
      );
    }
    process.exitCode = 2;
  } else {
    console.log("\nOK: todas las rutas multimedia tienen archivo físico.");
  }
}

main()
  .catch((err) => {
    console.error("[check-multimedia-files] error:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.close();
    } catch {
      /* ignore */
    }
  });
