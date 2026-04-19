const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require('../../middlewares/roles');

const controller = require('./fosiles.controller');

// ==============================
// 🧪 TEST
// ==============================
router.get('/test', auth, (req, res) => {
  res.json({
    mensaje: 'Ruta fósiles OK 🔥',
    user: req.user
  });
});

// ==============================
// 🔓 PÚBLICO - VER FÓSILES
// ==============================
router.get('/', controller.getFosiles);

// ==============================
// 🔐 ADMIN + INVESTIGADOR
// ==============================
router.get('/:id', auth, checkRole([1,2]), controller.getFosilById);

// ==============================
// 🧭 ADMIN + EXPLORADOR (CREAR)
// ==============================
router.post('/', auth, checkRole([1,3]), controller.createFosil);

// ==============================
// 👑 ADMIN
// ==============================
router.put('/:id', auth, checkRole([1]), controller.updateFosil);

router.delete('/:id', auth, checkRole([1]), controller.deleteFosil);

// ==============================
// 🔬 ADMIN + INVESTIGADOR (DETALLE)
// ==============================
router.get('/:id/detalle', auth, checkRole([1,2]), controller.getDetalleCompleto);

// CAMBIAR ESTADO (solo admin)
router.put('/:id/estado', auth, checkRole([1]), controller.changeEstado);

module.exports = router;