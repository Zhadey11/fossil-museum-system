const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");

const controller = require("./fosiles.controller");

router.get("/test", auth, (req, res) => {
  res.json({
    mensaje: "Ruta fósiles OK",
    user: req.user,
  });
});

router.get(
  "/mis-registros",
  auth,
  checkRole([1, 3]),
  controller.getMisRegistros,
);

router.get(
  "/investigador/catalogo",
  auth,
  checkRole([2]),
  controller.getInvestigadorCatalogo,
);

router.get("/", controller.getFosiles);

router.get(
  "/:id/detalle",
  auth,
  checkRole([1, 2]),
  controller.getDetalleCompleto,
);

router.get("/:id", controller.getFosilPublico);

router.post("/", auth, checkRole([1, 3]), controller.createFosil);

router.put("/:id", auth, checkRole([1, 3]), controller.updateFosil);

router.delete("/:id", auth, checkRole([1]), controller.deleteFosil);

router.put("/:id/estado", auth, checkRole([1]), controller.changeEstado);

module.exports = router;
