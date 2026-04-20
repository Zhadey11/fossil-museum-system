const express = require('express');
const router = express.Router();
const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");

const controller = require('./contacto.controller');

router.post('/', controller.sendMensaje);
router.get("/", auth, checkRole([1]), controller.listarMensajes);

module.exports = router;