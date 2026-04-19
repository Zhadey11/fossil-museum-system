const { pool } = require('../../config/db');

const obtenerUbicaciones = async () => {
  const result = await pool.request().query(`
    SELECT id, latitud, longitud, canton_id
    FROM FOSIL
    WHERE deleted_at IS NULL
  `);

  return result.recordset;
};

module.exports = {
  obtenerUbicaciones
};