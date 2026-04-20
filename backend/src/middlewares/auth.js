const jwt = require("jsonwebtoken");
const { isRevoked } = require("../security/tokenStore");

const authMiddleware = (req, res, next) => {
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
    req.token = token;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error JWT:", error.message);
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = authMiddleware;
