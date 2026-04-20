const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (user.roles && Array.isArray(user.roles)) {
      const tienePermiso = user.roles.some((r) =>
        rolesPermitidos.includes(r),
      );

      if (!tienePermiso) {
        return res.status(403).json({ error: "No tienes permisos" });
      }
    } else {
      if (!rolesPermitidos.includes(user.rol)) {
        return res.status(403).json({ error: "No tienes permisos" });
      }
    }

    next();
  };
};

module.exports = checkRole;
