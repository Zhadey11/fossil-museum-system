require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { pool } = require("../../config/db");
const { revokeToken } = require("../../security/tokenStore");

const BCRYPT_PREFIX = /^\$2[aby]\$/;

const login = async (email, password) => {
  const emailTrim = typeof email === "string" ? email.trim() : email;
  const result = await pool
    .request()
    .input("email", emailTrim)
    .query(`
      SELECT id, email, password_hash, activo
      FROM USUARIO
      WHERE email = @email AND deleted_at IS NULL
    `);

  const user = result.recordset[0];

  if (!user) {
    throw new Error("Credenciales inválidas");
  }
  if (!user.activo) {
    throw new Error("Usuario desactivado. Contacta a un administrador.");
  }

  let match = false;
  if (user.password_hash && BCRYPT_PREFIX.test(user.password_hash)) {
    match = await bcrypt.compare(password, user.password_hash);
  }

  if (!match) {
    throw new Error("Credenciales inválidas");
  }

  const rolesResult = await pool
    .request()
    .input("user_id", user.id)
    .query(`
      SELECT rol_id
      FROM USUARIO_ROL
      WHERE usuario_id = @user_id
      AND activo = 1
    `);

  const roles = rolesResult.recordset.map((r) => r.rol_id);

  const token = jwt.sign(
    {
      id: user.id,
      roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      roles,
    },
  };
};

const register = async (payload) => {
  const nombre = String(payload?.nombre || "").trim();
  const apellido = String(payload?.apellido || "").trim();
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "");
  const telefono = payload?.telefono ? String(payload.telefono).trim() : null;
  const pais = payload?.pais ? String(payload.pais).trim() : null;
  const profesion = payload?.profesion ? String(payload.profesion).trim() : null;
  const centroTrabajo = payload?.centro_trabajo ? String(payload.centro_trabajo).trim() : null;
  const requestedRole = Number.parseInt(payload?.rol_id, 10);
  const rolId = requestedRole === 3 ? 3 : 2; // investigador por defecto, explorador opcional

  if (!nombre || !apellido || !email || !password) {
    throw new Error("nombre, apellido, email y password son obligatorios");
  }
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const exists = await pool.request().input("email", email).query(`
    SELECT TOP 1 id
    FROM USUARIO
    WHERE email = @email
      AND deleted_at IS NULL
  `);
  if (exists.recordset?.length) {
    throw new Error("Ya existe una cuenta con ese correo");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const tx = pool.transaction();
  await tx.begin();
  try {
    const created = await tx
      .request()
      .input("rol_id", rolId)
      .input("nombre", nombre)
      .input("apellido", apellido)
      .input("email", email)
      .input("password_hash", passwordHash)
      .input("telefono", telefono)
      .input("pais", pais)
      .input("profesion", profesion)
      .input("centro_trabajo", centroTrabajo).query(`
        INSERT INTO USUARIO (
          rol_id, nombre, apellido, email, password_hash,
          telefono, pais, profesion, centro_trabajo
        )
        VALUES (
          @rol_id, @nombre, @apellido, @email, @password_hash,
          @telefono, @pais, @profesion, @centro_trabajo
        );
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
      `);
    const userId = Number(created.recordset?.[0]?.id);
    await tx.request().input("usuario_id", userId).input("rol_id", rolId).query(`
      INSERT INTO USUARIO_ROL (usuario_id, rol_id, activo)
      VALUES (@usuario_id, @rol_id, 1)
    `);
    await tx.commit();
    return { id: userId, email, rol_id: rolId };
  } catch (error) {
    await tx.rollback();
    throw error;
  }
};

const logout = async (token) => {
  revokeToken(token);
  return { mensaje: "Sesión cerrada" };
};

module.exports = { login, register, logout };
