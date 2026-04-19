const { pool } = require('../../config/db');

// GET
const obtenerMultimedia = async (fosil_id) => {
  const result = await pool.request()
    .input('fosil_id', fosil_id)
    .query(`
      SELECT id, url, tipo, descripcion
      FROM MULTIMEDIA
      WHERE fosil_id = @fosil_id
      AND deleted_at IS NULL
    `);

  return result.recordset;
};

// POST
const crearMultimedia = async (data) => {
  const result = await pool.request()
    .input('fosil_id', data.fosil_id)
    .input('url', data.url)
    .input('tipo', data.tipo)
    .input('descripcion', data.descripcion || null)
    .query(`
      INSERT INTO MULTIMEDIA (
        fosil_id, url, tipo, descripcion
      )
      VALUES (
        @fosil_id, @url, @tipo, @descripcion
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

// DELETE
const eliminarMultimedia = async (id) => {
  await pool.request()
    .input('id', id)
    .query(`
      UPDATE MULTIMEDIA
      SET deleted_at = GETDATE()
      WHERE id = @id
    `);

  return { id };
};

module.exports = {
  obtenerMultimedia,
  crearMultimedia,
  eliminarMultimedia
};