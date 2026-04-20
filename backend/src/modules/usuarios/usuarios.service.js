const bcrypt = require("bcrypt");
const { pool } = require("../../config/db");

async function upsertRolesUsuario(usuarioId, roles = []) {
  const uniqueRoles = [...new Set((roles || []).map((r) => parseInt(r, 10)).filter(Boolean))];
  const tx = pool.transaction();
  await tx.begin();
  try {
    await tx.request().input("usuario_id", usuarioId).query(`
      UPDATE USUARIO_ROL
      SET activo = 0
      WHERE usuario_id = @usuario_id
    `);
    for (const rolId of uniqueRoles) {
      await tx.request().input("usuario_id", usuarioId).input("rol_id", rolId).query(`
        IF EXISTS (SELECT 1 FROM USUARIO_ROL WHERE usuario_id = @usuario_id AND rol_id = @rol_id)
          UPDATE USUARIO_ROL SET activo = 1 WHERE usuario_id = @usuario_id AND rol_id = @rol_id;
        ELSE
          INSERT INTO USUARIO_ROL (usuario_id, rol_id, activo) VALUES (@usuario_id, @rol_id, 1);
      `);
    }
    await tx.request().input("usuario_id", usuarioId).query(`
      ;WITH principal AS (
        SELECT TOP 1 rol_id
        FROM USUARIO_ROL
        WHERE usuario_id = @usuario_id AND activo = 1
        ORDER BY rol_id ASC
      )
      UPDATE USUARIO
      SET rol_id = (SELECT rol_id FROM principal), updated_at = GETDATE()
      WHERE id = @usuario_id
        AND EXISTS (SELECT 1 FROM principal)
    `);
    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}

const obtenerUsuarios = async (query) => {
  try {
    let filtros = [];
    let request = pool.request();

    if (query.rol) {
      filtros.push("rol_id = @rol");
      request.input("rol", parseInt(query.rol));
    }

    if (query.activo) {
      filtros.push("activo = @activo");
      request.input("activo", query.activo === "true");
    }

    if (query.nombre) {
      filtros.push("nombre LIKE @nombre");
      request.input("nombre", `%${query.nombre}%`);
    }

    let sql = `
      SELECT
        u.id, u.nombre, u.apellido, u.email, u.rol_id, u.activo, u.created_at,
        u.telefono, u.pais, u.profesion, u.centro_trabajo,
        (
          SELECT ur.rol_id AS id, r.nombre
          FROM USUARIO_ROL ur
          INNER JOIN ROL r ON r.id = ur.rol_id
          WHERE ur.usuario_id = u.id AND ur.activo = 1
          FOR JSON PATH
        ) AS roles_json
      FROM USUARIO u
      WHERE u.deleted_at IS NULL
    `;

    if (filtros.length > 0) {
      sql += " AND " + filtros.join(" AND ");
    }

    sql += " ORDER BY created_at DESC";

    const result = await request.query(sql);

    return result.recordset;
  } catch (error) {
    console.error("ERROR USUARIOS:", error);
    throw error;
  }
};

const crearUsuario = async (data) => {
  try {
    const plain = data.password;
    if (!plain || typeof plain !== "string") {
      throw new Error("La contraseña es obligatoria");
    }
    const password_hash = await bcrypt.hash(plain, 10);

    const roleIds = Array.isArray(data.roles) && data.roles.length > 0
      ? data.roles
      : [data.rol_id || 2];
    const rolId = parseInt(roleIds[0], 10) || 2;

    const result = await pool
      .request()
      .input("rol_id", rolId)
      .input("nombre", data.nombre)
      .input("apellido", data.apellido)
      .input("email", data.email)
      .input("password_hash", password_hash)
      .input("telefono", data.telefono || null)
      .input("pais", data.pais || null)
      .input("profesion", data.profesion || null)
      .input("centro_trabajo", data.centro_trabajo || null)
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

    const newId = result.recordset[0].id;

    await upsertRolesUsuario(newId, roleIds);

    return { id: newId };
  } catch (error) {
    console.error("ERROR CREAR USUARIO:", error);
    throw error;
  }
};

const obtenerUsuarioPorId = async (id) => {
  try {
    const result = await pool
      .request()
      .input("id", id)
      .query(`
        SELECT
          u.id, u.nombre, u.apellido, u.email, u.rol_id, u.activo, u.created_at,
          u.telefono, u.pais, u.profesion, u.centro_trabajo,
          (
            SELECT ur.rol_id AS id, r.nombre
            FROM USUARIO_ROL ur
            INNER JOIN ROL r ON r.id = ur.rol_id
            WHERE ur.usuario_id = u.id AND ur.activo = 1
            FOR JSON PATH
          ) AS roles_json
        FROM USUARIO u
        WHERE u.id = @id AND u.deleted_at IS NULL
      `);
    const row = result.recordset[0];
    if (!row) return null;
    return {
      ...row,
      roles: row.roles_json ? JSON.parse(row.roles_json) : [],
    };
  } catch (error) {
    console.error("ERROR GET USUARIO BY ID:", error.message);
    throw error;
  }
};

const actualizarUsuario = async (id, data) => {
  try {
    const req = pool
      .request()
      .input("id", id)
      .input("nombre", data.nombre)
      .input("apellido", data.apellido)
      .input("telefono", data.telefono || null)
      .input("pais", data.pais || null)
      .input("profesion", data.profesion || null)
      .input("centro_trabajo", data.centro_trabajo || null);
    if (data.email) req.input("email", data.email);
    await req.query(`
        UPDATE USUARIO
        SET nombre = @nombre,
            apellido = @apellido,
            telefono = @telefono,
            pais = @pais,
            profesion = @profesion,
            centro_trabajo = @centro_trabajo,
            email = COALESCE(@email, email),
            updated_at = GETDATE()
        WHERE id = @id
      `);
    if (Array.isArray(data.roles)) {
      await upsertRolesUsuario(id, data.roles);
    }

    return { id };
  } catch (error) {
    console.error("ERROR UPDATE USUARIO:", error);
    throw error;
  }
};

const eliminarUsuario = async (id) => {
  try {
    await pool.request().input("id", id).query(`
        UPDATE USUARIO
        SET deleted_at = GETDATE()
        WHERE id = @id
      `);
    await pool.request().input("usuario_id", id).query(`
      UPDATE USUARIO_ROL
      SET activo = 0
      WHERE usuario_id = @usuario_id
    `);

    return { id };
  } catch (error) {
    console.error("ERROR DELETE USUARIO:", error);
    throw error;
  }
};

const obtenerRoles = async () => {
  const result = await pool.request().query(`
    SELECT id, nombre, descripcion
    FROM ROL
    WHERE activo = 1
    ORDER BY id ASC
  `);
  return result.recordset;
};

const actualizarRolesUsuario = async (id, roles) => {
  await upsertRolesUsuario(id, roles);
  return { id };
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerRoles,
  actualizarRolesUsuario,
};
