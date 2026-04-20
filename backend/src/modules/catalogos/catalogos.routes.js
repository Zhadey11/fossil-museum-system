const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");
const controller = require("./catalogos.controller");

router.get(
  "/fosil-form",
  auth,
  checkRole([1, 3]),
  controller.getCatalogosFormularioFosil,
);

module.exports = router;
