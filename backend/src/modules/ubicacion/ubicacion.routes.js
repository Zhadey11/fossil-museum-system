const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require("../../middlewares/roles");
const controller = require('./ubicacion.controller');

router.get('/', auth, checkRole([1, 2]), controller.getUbicaciones);

module.exports = router;