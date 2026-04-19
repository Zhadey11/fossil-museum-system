const { pool } = require('../../config/db');

// ==============================
// 👤 OBTENER USUARIOS (CON FILTROS)
// ==============================
const obtenerUsuarios = async (query) => {
  try {
    let filtros = [];
    let request = pool.request();

    if (query.rol) {
      filtros.push('rol_id = @rol');
      request.input('rol', parseInt(query.rol));
    }

    if (query.activo) {
      filtros.push('activo = @activo');
      request.input('activo', query.activo === 'true');
    }

    if (query.nombre) {
      filtros.push('nombre LIKE @nombre');
      request.input('nombre', `%${query.nombre}%`);
    }

    let sql = `
      SELECT id, nombre, apellido, email, rol_id, activo, created_at
      FROM USUARIO
      WHERE deleted_at IS NULL
    `;

    if (filtros.length > 0) {
      sql += ' AND ' + filtros.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await request.query(sql);

    return result.recordset;

  } catch (error) {
    console.error('ERROR USUARIOS:', error);
    throw error;
  }
};


// ==============================
// 👥 CREAR USUARIO
// ==============================
const crearUsuario = async (data) => {
  try {
    const result = await pool.request()
      .input('rol_id', data.rol_id || 2)
      .input('nombre', data.nombre)
      .input('apellido', data.apellido)
      .input('email', data.email)
      .input('password_hash', data.password)
      .input('telefono', data.telefono || null)
      .input('pais', data.pais || null)
      .input('profesion', data.profesion || null)
      .input('centro_trabajo', data.centro_trabajo || null)

      .query(`
        INSERT INTO USUARIO (
          rol_id, nombre, apellido, email, password_hash,
          telefono, pais, profesion, centro_trabajo
        )
        VALUES (
          @rol_id, @nombre, @apellido, @email, @password_hash,
          @telefono, @pais, @profesion, @centro_trabajo
        );

        SELECT SCOPE_IDENTITY() AS id;
      `);

    return result.recordset[0];

  } catch (error) {
    console.error('ERROR CREAR USUARIO:', error);
    throw error;
  }
};

// ==============================
// 👤 GET USUARIO POR ID
// ==============================
const obtenerUsuarioPorId = async (id) => {
  try {
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT id, nombre, apellido, email, rol_id, activo, created_at
        FROM USUARIO
        WHERE id = @id AND deleted_at IS NULL
      `);

    return result.recordset[0];

  } catch (error) {
    console.error('❌ ERROR GET USUARIO BY ID:', error.message);
    throw error;
  }
};

// ==============================
// 👥 UPDATE USUARIO
// ==============================
const actualizarUsuario = async (id, data) => {
  try {
    await pool.request()
      .input('id', id)
      .input('nombre', data.nombre)
      .input('apellido', data.apellido)
      .input('telefono', data.telefono || null)
      .input('pais', data.pais || null)
      .input('profesion', data.profesion || null)
      .input('centro_trabajo', data.centro_trabajo || null)

      .query(`
        UPDATE USUARIO
        SET nombre = @nombre,
            apellido = @apellido,
            telefono = @telefono,
            pais = @pais,
            profesion = @profesion,
            centro_trabajo = @centro_trabajo,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    return { id };

  } catch (error) {
    console.error('ERROR UPDATE USUARIO:', error);
    throw error;
  }
};

// ==============================
// 👥 SOFT DELETE USUARIO
// ==============================
const eliminarUsuario = async (id) => {
  try {
    await pool.request()
      .input('id', id)
      .query(`
        UPDATE USUARIO
        SET deleted_at = GETDATE()
        WHERE id = @id
      `);

    return { id };

  } catch (error) {
    console.error('ERROR DELETE USUARIO:', error);
    throw error;
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId, // 👈 NUEVO
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};