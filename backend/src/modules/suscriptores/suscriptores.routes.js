const express = require("express");
const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");
const c = require("./suscriptores.controller");

const router = express.Router();

router.post("/", c.crearSuscripcion);
router.get("/", auth, checkRole([1]), c.listarSuscriptores);
router.get("/historial", auth, checkRole([1]), c.historial);
router.patch("/:id", auth, checkRole([1]), c.actualizarSuscriptor);
router.delete("/:id", auth, checkRole([1]), c.eliminarSuscriptor);

module.exports = router;
