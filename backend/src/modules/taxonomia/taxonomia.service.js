const { pool } = require('../../config/db');

// GET TODAS
const obtenerTaxonomias = async () => {
  const result = await pool.request().query(`
    SELECT *
    FROM TAXONOMIA
    ORDER BY id DESC
  `);

  return result.recordset;
};

// GET POR ID
const obtenerTaxonomiaPorId = async (id) => {
  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT *
      FROM TAXONOMIA
      WHERE id = @id
    `);

  return result.recordset[0];
};

// CREAR
const crearTaxonomia = async (data) => {
  const result = await pool.request()
    .input('reino', data.reino)
    .input('filo', data.filo)
    .input('clase', data.clase)
    .input('orden', data.orden)
    .input('familia', data.familia)
    .input('genero', data.genero)
    .input('especie', data.especie)

    .query(`
      INSERT INTO TAXONOMIA (
        reino, filo, clase, orden, familia, genero, especie
      )
      VALUES (
        @reino, @filo, @clase, @orden, @familia, @genero, @especie
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

// DELETE (físico, porque NO hay soft delete)
const eliminarTaxonomia = async (id) => {
  await pool.request()
    .input('id', id)
    .query(`
      DELETE FROM TAXONOMIA
      WHERE id = @id
    `);

  return { id };
};

module.exports = {
  obtenerTaxonomias,
  obtenerTaxonomiaPorId,
  crearTaxonomia,
  eliminarTaxonomia
};