const { pool } = require('../../config/db');

async function ensureTaxonomiaSoftDeleteColumn() {
  await pool.request().query(`
    IF COL_LENGTH('dbo.TAXONOMIA', 'deleted_at') IS NULL
    BEGIN
      ALTER TABLE TAXONOMIA ADD deleted_at DATETIME2 NULL;
    END;
  `);
}

// GET TODAS
const obtenerTaxonomias = async () => {
  await ensureTaxonomiaSoftDeleteColumn();
  const result = await pool.request().query(`
    SELECT *
    FROM TAXONOMIA
    WHERE deleted_at IS NULL
    ORDER BY id DESC
  `);

  return result.recordset;
};

// GET POR ID
const obtenerTaxonomiaPorId = async (id) => {
  await ensureTaxonomiaSoftDeleteColumn();
  const result = await pool.request()
    .input('id', id)
    .query(`
      SELECT *
      FROM TAXONOMIA
      WHERE id = @id
        AND deleted_at IS NULL
    `);

  return result.recordset[0];
};

// CREAR
const crearTaxonomia = async (data) => {
  await ensureTaxonomiaSoftDeleteColumn();
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
        reino, filo, clase, orden, familia, genero, especie, deleted_at
      )
      VALUES (
        @reino, @filo, @clase, @orden, @familia, @genero, @especie, NULL
      );

      SELECT SCOPE_IDENTITY() AS id;
    `);

  return result.recordset[0];
};

// DELETE lógico
const eliminarTaxonomia = async (id) => {
  await ensureTaxonomiaSoftDeleteColumn();
  await pool.request()
    .input('id', id)
    .query(`
      UPDATE TAXONOMIA
      SET deleted_at = COALESCE(deleted_at, GETDATE())
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