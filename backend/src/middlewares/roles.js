const checkRole = (rolesPermitidos) => {
  const permitidos = rolesPermitidos.map((r) => Number(r));
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (user.roles && Array.isArray(user.roles)) {
      const tienePermiso = user.roles.some((r) =>
        permitidos.includes(Number(r)),
      );

      if (!tienePermiso) {
        return res.status(403).json({ error: "No tienes permisos" });
      }
    } else {
      if (!permitidos.includes(Number(user.rol))) {
        return res.status(403).json({ error: "No tienes permisos" });
      }
    }

    next();
  };
};

module.exports = checkRole;
