const { pool } = require('../../config/db');

const obtenerGeologia = async ({ isAdmin = false } = {}) => {
  const request = pool.request();
  let sql = `
    SELECT id, era_id, periodo_id
    FROM FOSIL
    WHERE deleted_at IS NULL
  `;
  if (!isAdmin) {
    sql += " AND estado = @estado_publicado";
    request.input("estado_publicado", "publicado");
  }
  const result = await request.query(sql);

  return result.recordset;
};

module.exports = { obtenerGeologia };