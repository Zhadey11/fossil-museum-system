const express = require('express');
const router = express.Router();

const controller = require('./contacto.controller');

router.post('/', controller.sendMensaje);

module.exports = router;