const { pool } = require('../../config/db');

// ==============================
// 🦴 GET FÓSILES (con filtro)
// ==============================
const obtenerFosiles = async (query) => {
  try {
    let request = pool.request();

    let sql = `
      SELECT *
      FROM FOSIL
      WHERE deleted_at IS NULL
    `;

    // 🔥 FILTRO POR ESTADO (OPCIONAL)
    if (query.estado) {
      sql += ` AND estado = @estado`;
      request.input('estado', query.estado);
    }

    const result = await request.query(sql);
    return result.recordset;

  } catch (error) {
    throw error;
  }
};

// ==============================
// 🦴 GET POR ID
// ==============================
const obtenerFosilPorId = async (id) => {
  try {
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT *
        FROM FOSIL
        WHERE id = @id AND deleted_at IS NULL
      `);

    return result.recordset[0];

  } catch (error) {
    throw error;
  }
};

// ==============================
// 🦴 DETALLE COMPLETO
// ==============================
const obtenerDetalleCompleto = async (id) => {
  try {
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT *
        FROM FOSIL
        WHERE id = @id
      `);

    return result.recordset[0];

  } catch (error) {
    throw error;
  }
};

// ==============================
// 🦴 CREAR FÓSIL (EXPLORADOR)
// ==============================
const crearFosil = async (data, user) => {
  try {
    const result = await pool.request()
      .input('codigo_unico', `CR-TEST-${Date.now()}`)
      .input('canton_id', data.canton_id)
      .input('categoria_id', data.categoria_id)
      .input('era_id', data.era_id)
      .input('periodo_id', data.periodo_id)
      .input('explorador_id', user.id)
      .input('nombre', data.nombre)
      .input('slug', data.nombre.toLowerCase().replace(/\s+/g, '-'))
      .input('descripcion_general', 'Pendiente de revisión')

      // 🔥 CLAVE: ESTADO AUTOMÁTICO
      .input('estado', 'pendiente')

      .query(`
        INSERT INTO FOSIL (
          codigo_unico,
          canton_id,
          categoria_id,
          era_id,
          periodo_id,
          explorador_id,
          nombre,
          slug,
          descripcion_general,
          estado
        )
        OUTPUT INSERTED.id
        VALUES (
          @codigo_unico,
          @canton_id,
          @categoria_id,
          @era_id,
          @periodo_id,
          @explorador_id,
          @nombre,
          @slug,
          @descripcion_general,
          @estado
        )
      `);

    return result.recordset[0];

  } catch (error) {
    throw error;
  }
};

// ==============================
// 🦴 UPDATE
// ==============================
const actualizarFosil = async (id, data) => {
  try {
    await pool.request()
      .input('id', id)
      .input('nombre', data.nombre)
      .query(`
        UPDATE FOSIL
        SET nombre = @nombre
        WHERE id = @id
      `);

  } catch (error) {
    throw error;
  }
};

// ==============================
// 🦴 DELETE (SOFT DELETE)
// ==============================
const eliminarFosil = async (id) => {
  try {
    await pool.request()
      .input('id', id)
      .query(`
        UPDATE FOSIL
        SET deleted_at = GETDATE()
        WHERE id = @id
      `);

  } catch (error) {
    throw error;
  }
};

// ==============================
// 🦴 CAMBIAR ESTADO (ADMIN)
// ==============================
const cambiarEstadoFosil = async (id, estado) => {
  try {
    await pool.request()
      .input('id', id)
      .input('estado', estado)
      .query(`
        UPDATE FOSIL
        SET estado = @estado
        WHERE id = @id
      `);

    return { id, estado };

  } catch (error) {
    throw error;
  }
};

// ==============================
// EXPORTS
// ==============================
module.exports = {
  obtenerFosiles,
  obtenerFosilPorId,
  obtenerDetalleCompleto,
  crearFosil,
  actualizarFosil,
  eliminarFosil,
  cambiarEstadoFosil
};