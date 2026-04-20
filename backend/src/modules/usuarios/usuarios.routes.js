const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");

const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerRoles,
  actualizarRolesUsuario,
  actualizarActivoUsuario,
} = require("./usuarios.service");

router.get("/", auth, checkRole([1]), async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios(req.query);
    res.json(
      usuarios.map((u) => ({
        ...u,
        roles: u.roles_json ? JSON.parse(u.roles_json) : [],
      })),
    );
  } catch (error) {
    console.error("ERROR GET USUARIOS:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/catalogo/roles", auth, checkRole([1]), async (_req, res) => {
  try {
    const roles = await obtenerRoles();
    res.json(roles);
  } catch (error) {
    console.error("ERROR GET ROLES:", error);
    res.status(500).json({ error: "Error al obtener roles" });
  }
});

router.get("/:id", auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await obtenerUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("ERROR GET USUARIO BY ID:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

router.post("/", auth, checkRole([1]), async (req, res) => {
  try {
    const usuario = await crearUsuario(req.body);

    res.json({
      mensaje: "Usuario creado",
      usuario,
    });
  } catch (error) {
    console.error("ERROR CREATE USUARIO:", error);
    res.status(500).json({ error: error.message || "Error al crear usuario" });
  }
});

router.put("/:id", auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;

    await actualizarUsuario(id, req.body);

    res.json({
      mensaje: "Usuario actualizado",
      id,
    });
  } catch (error) {
    console.error("ERROR UPDATE USUARIO:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

router.delete("/:id", auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;

    await eliminarUsuario(id);

    res.json({
      mensaje: "Usuario eliminado (soft delete)",
      id,
    });
  } catch (error) {
    console.error("ERROR DELETE USUARIO:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

router.put("/:id/roles", auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;
    const roles = Array.isArray(req.body?.roles) ? req.body.roles : [];
    if (roles.length === 0) {
      return res.status(400).json({ error: "Debes enviar al menos un rol" });
    }
    await actualizarRolesUsuario(id, roles);
    res.json({ mensaje: "Roles actualizados", id });
  } catch (error) {
    console.error("ERROR UPDATE USUARIO ROLES:", error);
    res.status(500).json({ error: "Error al actualizar roles" });
  }
});

router.patch("/:id/activo", auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;
    const activo = Boolean(req.body?.activo);
    await actualizarActivoUsuario(id, activo);
    res.json({ mensaje: `Usuario ${activo ? "activado" : "desactivado"}`, id, activo });
  } catch (error) {
    console.error("ERROR UPDATE USUARIO ACTIVO:", error);
    res.status(500).json({ error: "Error al cambiar estado del usuario" });
  }
});

module.exports = router;
