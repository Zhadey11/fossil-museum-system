/**
 * Cuenta en BD las mismas filas que el catálogo web (API /api/multimedia/publico/catalogo).
 *   cd backend && node scripts/ver-catalogo-publico.js
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { pool, poolConnect } = require("../src/config/db");
const { diskPathFromPublicUrl } = require("../src/config/paths");

(async () => {
  await poolConnect;
  console.log("Base (env):", process.env.DB_DATABASE);

  const porEstado = await pool.request()
    .query(`SELECT f.estado, COUNT(*) n
      FROM dbo.FOSIL f WHERE f.deleted_at IS NULL
      GROUP BY f.estado`);

  const comoApi = await pool.request().query(`
    SELECT m.url
    FROM dbo.MULTIMEDIA m
    INNER JOIN dbo.FOSIL f ON f.id = m.fosil_id
    WHERE m.deleted_at IS NULL
      AND f.deleted_at IS NULL
      AND f.estado = N'publicado'
      AND m.tipo = N'imagen'
  `);
  const urls = (comoApi.recordset || []).map((r) => r.url).filter(Boolean);
  const conArchivo = urls.filter((u) => {
    const p = diskPathFromPublicUrl(u);
    try {
      return p && fs.existsSync(p) && fs.statSync(p).isFile();
    } catch {
      return false;
    }
  }).length;

  const prereq = await pool.request().query(`
    SELECT
      (SELECT TOP 1 id FROM dbo.USUARIO WHERE email = N'admin@stonewake.org' AND deleted_at IS NULL) AS admin_id,
      (SELECT TOP 1 id FROM dbo.USUARIO WHERE email = N'explorador@stonewake.org' AND deleted_at IS NULL) AS expl_id,
      (SELECT TOP 1 id FROM dbo.USUARIO WHERE email = N'miguel@stonewake.org' AND deleted_at IS NULL) AS miguel_id
  `);

  console.log("\nFOSIL por estado:", porEstado.recordset);
  console.log("Filas en BD (publicado + imagen):", urls.length);
  console.log("Con archivo en disco (así el catálogo web las muestra):", conArchivo);
  if (urls.length > conArchivo) {
    console.log(
      "  (Hay",
      urls.length - conArchivo,
      "URLs sin fichero: alineá con backend/images y `npm run apply:media-rules` o `check:media`.)",
    );
  }
  console.log("IDs usuarios 05/07 (null = 07 no puede haber insertado fósiles):", prereq.recordset[0]);

  if (urls.length === 0) {
    console.log(`
Si "Filas... API" = 0:
  1) Ejecutá en orden: database/ORDEN_EJECUCION.txt (hasta 08). Sin 05 no hay admin/explorador; sin 07 no hay fósiles de catálogo.
  2) Si 07 devolvió error (mensaje con THROW 5000x) en SSMS, la transacción hizo ROLLBACK: corregí lo que falte y volvé a ejecutar 07.
`);
  }
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
