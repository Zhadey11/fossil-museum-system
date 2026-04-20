const { pool } = require("../../config/db");

const obtenerCatalogosFormularioFosil = async () => {
  const [cats, eras, pers, cant] = await Promise.all([
    pool.request().query(`
      SELECT id, codigo, nombre
      FROM CATEGORIA_FOSIL
      WHERE activo = 1
      ORDER BY id
    `),
    pool.request().query(`
      SELECT id, nombre
      FROM ERA_GEOLOGICA
      WHERE activo = 1
      ORDER BY ma_inicio DESC
    `),
    pool.request().query(`
      SELECT id, era_id, nombre
      FROM PERIODO_GEOLOGICO
      WHERE activo = 1
      ORDER BY era_id, ma_inicio DESC
    `),
    pool.request().query(`
      SELECT id, codigo, nombre
      FROM CANTON
      WHERE activo = 1
      ORDER BY nombre
    `),
  ]);

  return {
    categorias: cats.recordset,
    eras: eras.recordset,
    periodos: pers.recordset,
    cantones: cant.recordset,
  };
};

module.exports = { obtenerCatalogosFormularioFosil };
