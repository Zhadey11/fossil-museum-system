const { pool } = require('../../config/db');

const obtenerUbicaciones = async ({ isAdmin = false } = {}) => {
  const request = pool.request();
  let sql = `
    SELECT id, latitud, longitud, canton_id
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

module.exports = {
  obtenerUbicaciones
};