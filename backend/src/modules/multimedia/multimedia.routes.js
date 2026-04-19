const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require('../../middlewares/roles');
const controller = require('./multimedia.controller');

// 🔥 MULTER
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ==============================
// 📸 SUBIR IMAGEN
// ==============================
router.post('/upload', auth, upload.single('file'), (req, res) => {
  res.json({
    mensaje: 'Archivo subido correctamente 📸',
    archivo: req.file.filename
  });
});

// ==============================
// 📁 GET por fósil
// ==============================
router.get('/:fosil_id', auth, controller.getMultimedia);

// ==============================
// ➕ REGISTRAR EN BD (admin)
// ==============================
router.post('/', auth, checkRole([1]), controller.createMultimedia);

// ==============================
// ❌ DELETE (admin)
// ==============================
router.delete('/:id', auth, checkRole([1]), controller.deleteMultimedia);

module.exports = router;