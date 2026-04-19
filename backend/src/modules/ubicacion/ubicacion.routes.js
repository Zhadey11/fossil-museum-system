const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const controller = require('./ubicacion.controller');

router.get('/', auth, controller.getUbicaciones);

module.exports = router;