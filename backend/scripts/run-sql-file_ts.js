/* eslint-disable no-console */
/**
 * Ejecuta un .sql con lotes separados por GO (misma conexión que el API).
 * Uso: node scripts/run-sql-file.js ../database/05b_catalogo_demo.sql
 */
const fs = require("fs");
const path = require("path");
const { poolConnect, pool } = require("../src/config/db");

async function main() {
  const rel = process.argv[2];
  if (!rel) {
    console.error('Uso: node scripts/run-sql-file.js "<ruta-al-.sql>"');
    process.exit(1);
  }
  const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  if (!fs.existsSync(abs)) {
    console.error("No existe:", abs);
    process.exit(1);
  }
  const raw = fs.readFileSync(abs, "utf8");
  const batches = raw
    .split(/^\s*GO\s*$/gim)
    .map((s) => s.trim())
    .filter(Boolean);

  await poolConnect;
  console.log("Archivo:", abs);
  console.log("Lotes:", batches.length);

  for (let i = 0; i < batches.length; i += 1) {
    const sql = batches[i];
    if (/^\s*USE\s+/i.test(sql)) {
      console.log(`Lote ${i + 1}: USE (omitido en driver; ya estás en ${process.env.DB_DATABASE})`);
      continue;
    }
    await pool.request().query(sql);
    console.log(`Lote ${i + 1}/${batches.length}: OK`);
  }

  await pool.close();
  console.log("Listo.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exitCode = 1;
});
