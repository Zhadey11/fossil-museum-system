const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Verificar si viene el header
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // 2. Verificar formato "Bearer TOKEN"
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    // 3. Extraer token
    const token = authHeader.split(' ')[1];

    // 4. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Guardar usuario en request
    req.user = decoded;

    console.log('✅ Usuario autenticado:', decoded);

    next();
  } catch (error) {
    console.error('❌ Error JWT:', error.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authMiddleware;