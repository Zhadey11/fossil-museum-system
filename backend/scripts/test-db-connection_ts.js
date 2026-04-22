/* eslint-disable no-console */
/**
 * Prueba rápida de conexión a SQL Server usando la misma config que el API (backend/.env).
 * Uso: node scripts/test-db-connection.js
 */
const { poolConnect, pool } = require("../src/config/db");

async function main() {
  await poolConnect;
  const r = await pool.request().query(`
    SELECT
      DB_NAME() AS base_actual,
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = N'dbo') AS tablas_dbo,
      (SELECT COUNT(*) FROM dbo.FOSIL WHERE deleted_at IS NULL) AS fosiles_activos
  `);
  console.log("Conexión OK:", JSON.stringify(r.recordset[0], null, 2));
  await pool.close();
}

main().catch((e) => {
  console.error("Conexión falló:", e.message);
  process.exitCode = 1;
});
