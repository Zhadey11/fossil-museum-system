const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require("../../middlewares/roles");
const controller = require('./estudios.controller');

router.get("/", auth, checkRole([1, 2]), controller.getEstudios);

module.exports = router;