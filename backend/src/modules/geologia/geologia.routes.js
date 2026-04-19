const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const controller = require('./geologia.controller');

router.get('/', auth, controller.getGeologia);

module.exports = router;