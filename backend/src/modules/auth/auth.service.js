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
      SELECT id, email, password_hash
      FROM USUARIO
      WHERE email = @email AND deleted_at IS NULL
    `);

  const user = result.recordset[0];

  if (!user) {
    throw new Error("Credenciales inválidas");
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

const logout = async (token) => {
  revokeToken(token);
  return { mensaje: "Sesión cerrada" };
};

module.exports = { login, logout };
