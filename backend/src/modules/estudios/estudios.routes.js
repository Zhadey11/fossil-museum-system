const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const controller = require('./estudios.controller');

router.get('/', auth, controller.getEstudios);

module.exports = router;