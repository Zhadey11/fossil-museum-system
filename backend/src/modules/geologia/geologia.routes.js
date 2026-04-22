const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require("../../middlewares/roles");
const controller = require('./geologia.controller');

router.get('/', auth, checkRole([1, 2]), controller.getGeologia);

module.exports = router;