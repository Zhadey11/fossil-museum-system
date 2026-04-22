/* eslint-disable no-console */

/**

 * Para filas MULTIMEDIA con url bajo /uploads/public/ cuyo archivo no existe,

 * sugiere otro archivo en uploads/public con nombre parecido (solo lectura + salida SQL comentada).

 *

 *   cd backend && node scripts/suggest-multimedia-uploads-remap.js

 */

const fs = require("fs");

const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { pool, poolConnect } = require("../src/config/db");

const { diskPathFromPublicUrl, UPLOADS_DIR } = require("../src/config/paths");



function normBase(name) {

  return String(name || "")

    .replace(/\.[a-z0-9]+$/i, "")

    .replace(/[_-]+/g, "")

    .toLowerCase();

}



function scoreSimilar(want, candidate) {

  const a = normBase(want);

  const b = normBase(candidate);

  if (!a.length || !b.length) return 0;

  if (a === b) return 1000;

  if (b.includes(a) || a.includes(b)) return 800;

  let n = 0;

  const lim = Math.min(a.length, b.length, 12);

  for (let i = 0; i < lim; i += 1) {

    if (a[i] === b[i]) n += 1;

  }

  return n;

}



async function main() {

  await poolConnect;

  const publicDir = path.join(UPLOADS_DIR, "public");

  const onDisk = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];

  const r = await pool.request().query(`

    SELECT m.id, m.url, m.nombre_archivo, m.fosil_id

    FROM MULTIMEDIA m

    WHERE m.deleted_at IS NULL AND m.tipo = 'imagen'

      AND m.url LIKE '/uploads/public/%'

    ORDER BY m.id

  `);

  const rows = r.recordset || [];

  console.log("\n=== Sugerencias (archivo falta en uploads/public) ===\n");



  for (const row of rows) {

    const disk = diskPathFromPublicUrl(row.url);

    if (disk && fs.existsSync(disk)) continue;

    const want = row.nombre_archivo || path.basename(row.url || "");

    let best = null;

    let bestS = -1;

    for (const f of onDisk) {

      const s = scoreSimilar(want, f);

      if (s > bestS) {

        bestS = s;

        best = f;

      }

    }

    if (best && bestS >= 6) {

      console.log(

        `-- id=${row.id} fosil=${row.fosil_id} falta=${want} -> candidato=${best} (score ${bestS})`,

      );

      console.log(

        `-- UPDATE MULTIMEDIA SET url=N'/uploads/public/${best.replace(/'/g, "''")}', nombre_archivo=N'${String(

          best,

        ).replace(/'/g, "''")}' WHERE id=${row.id} AND deleted_at IS NULL;`,

      );

    } else if (want) {

      console.log(`-- id=${row.id} fosil=${row.fosil_id} sin candidato claro para: ${want}`);

    }

  }

  console.log("\n(Revisá y ejecutá manualmente los UPDATE en SQL Server si aplican.)\n");

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

