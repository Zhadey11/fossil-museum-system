/* eslint-disable no-console */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool, poolConnect } = require("../src/config/db");

function splitNameExt(filename) {
  const ext = path.extname(filename || "");
  const base = ext ? String(filename).slice(0, -ext.length) : String(filename || "");
  return { base, ext: ext || "" };
}

async function getDuplicateRows() {
  const result = await pool.request().query(`
    WITH dup AS (
      SELECT nombre_archivo
      FROM MULTIMEDIA
      WHERE deleted_at IS NULL
        AND nombre_archivo IS NOT NULL
        AND LTRIM(RTRIM(nombre_archivo)) <> ''
      GROUP BY nombre_archivo
      HAVING COUNT(DISTINCT fosil_id) > 1
    )
    SELECT
      m.id,
      m.fosil_id,
      m.nombre_archivo
    FROM MULTIMEDIA m
    INNER JOIN dup d ON d.nombre_archivo = m.nombre_archivo
    WHERE m.deleted_at IS NULL
    ORDER BY m.nombre_archivo ASC, m.fosil_id ASC, m.id ASC
  `);
  return result.recordset || [];
}

function planRenames(rows) {
  const grouped = new Map();
  for (const r of rows) {
    const key = String(r.nombre_archivo || "");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(r);
  }

  const plans = [];
  for (const [nombre, list] of grouped.entries()) {
    const byFossil = new Map();
    for (const row of list) {
      if (!byFossil.has(row.fosil_id)) byFossil.set(row.fosil_id, []);
      byFossil.get(row.fosil_id).push(row);
    }
    if (byFossil.size <= 1) continue;

    // Conserva el primer registro original; renombra los demás para evitar colisiones visuales.
    const sorted = [...list].sort((a, b) => a.id - b.id);
    const keepId = sorted[0].id;
    const { base, ext } = splitNameExt(nombre);
    for (const row of sorted) {
      if (row.id === keepId) continue;
      const suffix = `__f${row.fosil_id}_m${row.id}`;
      plans.push({
        id: row.id,
        fosil_id: row.fosil_id,
        oldName: nombre,
        newName: `${base}${suffix}${ext}`,
      });
    }
  }
  return plans;
}

async function applyRenames(plans) {
  for (const p of plans) {
    await pool
      .request()
      .input("id", p.id)
      .input("nombre", p.newName)
      .query(`
        UPDATE MULTIMEDIA
        SET nombre_archivo = @nombre
        WHERE id = @id
      `);
  }
}

async function main() {
  await poolConnect;
  const dryRun = process.argv.includes("--dry-run") || !process.argv.includes("--apply");
  const rows = await getDuplicateRows();
  const plans = planRenames(rows);

  console.log("\n=== Fix duplicate multimedia.nombre_archivo ===");
  console.log(`Registros en conflicto: ${rows.length}`);
  console.log(`Renombres planificados: ${plans.length}`);

  if (plans.length === 0) {
    console.log("No hay cambios por aplicar.");
    return;
  }

  console.log("\n--- Plan (muestra) ---");
  for (const p of plans.slice(0, 30)) {
    console.log(`[id=${p.id} fosil=${p.fosil_id}] "${p.oldName}" -> "${p.newName}"`);
  }

  if (dryRun) {
    console.log("\nModo dry-run. Para aplicar: node scripts/fix-media-filename-duplicates.js --apply");
    return;
  }

  await applyRenames(plans);
  console.log(`\nCambios aplicados: ${plans.length}`);
}

main()
  .catch((err) => {
    console.error("[fix-media-filename-duplicates] error:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.close();
    } catch {
      /* ignore */
    }
  });
