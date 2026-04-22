const express = require('express');
const router = express.Router();
const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");

const controller = require('./contacto.controller');

router.post('/', controller.sendMensaje);
router.get("/", auth, checkRole([1]), controller.listarMensajes);
router.patch("/:id/leido", auth, checkRole([1]), controller.marcarLeido);
router.patch(
  "/:id/aprobar-solicitud",
  auth,
  checkRole([1]),
  controller.aprobarSolicitud,
);
router.patch(
  "/:id/rechazar-solicitud",
  auth,
  checkRole([1]),
  controller.rechazarSolicitud,
);
router.delete("/:id", auth, checkRole([1]), controller.eliminarMensaje);

module.exports = router;