require('dotenv').config();

const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

const login = async (email, password) => {

  // 🔎 1. Buscar usuario
  const result = await pool.request()
    .input('email', email)
    .query(`
      SELECT id, email, password_hash
      FROM USUARIO
      WHERE email = @email AND deleted_at IS NULL
    `);

  const user = result.recordset[0];

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // 🔐 2. Validación (temporal)
  const match = password === "Admin123!";

  if (!match) {
    throw new Error('Contraseña incorrecta');
  }

  // 🔥 3. TRAER TODOS LOS ROLES
  const rolesResult = await pool.request()
    .input('user_id', user.id)
    .query(`
      SELECT rol_id
      FROM USUARIO_ROL
      WHERE usuario_id = @user_id
      AND activo = 1
    `);

  const roles = rolesResult.recordset.map(r => r.rol_id);

  // 🔐 4. TOKEN MULTIROL
  const token = jwt.sign(
    {
      id: user.id,
      roles: roles   // 👈 🔥 IMPORTANTE
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      roles: roles   // 👈 también aquí
    }
  };
};

module.exports = { login };