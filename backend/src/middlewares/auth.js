const jwt = require("jsonwebtoken");
const { isRevoked } = require("../security/tokenStore");
const { pool } = require("../config/db");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Formato de token inválido" });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (isRevoked(token)) {
      return res.status(401).json({ error: "Token revocado. Inicia sesión de nuevo." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userCheck = await pool
      .request()
      .input("id", decoded.id)
      .query(`
        SELECT id, activo, deleted_at
        FROM USUARIO
        WHERE id = @id
      `);
    const row = userCheck.recordset[0];
    if (!row || row.deleted_at || !row.activo) {
      return res.status(401).json({ error: "Usuario inactivo o eliminado" });
    }
    req.token = token;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error JWT:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
