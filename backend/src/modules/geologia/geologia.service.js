const { pool } = require('../../config/db');

const obtenerGeologia = async () => {
  const result = await pool.request().query(`
    SELECT id, era_id, periodo_id
    FROM FOSIL
    WHERE deleted_at IS NULL
  `);

  return result.recordset;
};

module.exports = { obtenerGeologia };