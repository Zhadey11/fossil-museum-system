const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require('../../middlewares/roles');

const {
  aprobar,
  rechazar,
  pendientes
} = require('./admin.controller');

// 🛡️ SOLO ADMIN
router.patch('/fosiles/:id/aprobar', auth, checkRole([1]), aprobar);
router.patch('/fosiles/:id/rechazar', auth, checkRole([1]), rechazar);
router.get('/fosiles/pendientes', auth, checkRole([1]), pendientes);

module.exports = router;