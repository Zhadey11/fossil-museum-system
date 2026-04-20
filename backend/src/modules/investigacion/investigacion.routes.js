const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");
const controller = require("./investigacion.controller");

router.post(
  "/solicitudes",
  auth,
  checkRole([2]),
  controller.crearSolicitud,
);

router.get(
  "/mis-solicitudes",
  auth,
  checkRole([2]),
  controller.listarMisSolicitudes,
);

module.exports = router;
