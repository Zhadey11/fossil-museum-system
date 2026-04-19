const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require('../../middlewares/roles');

const {
  obtenerUsuarios,
  obtenerUsuarioPorId, // 👈 NUEVO
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('./usuarios.service');

// ==============================
// 👥 GET USUARIOS (ADMIN)
// ==============================
router.get('/', auth, checkRole([1]), async (req, res) => {
  try {
    const usuarios = await obtenerUsuarios(req.query);
    res.json(usuarios);
  } catch (error) {
    console.error('ERROR GET USUARIOS:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// 👤 GET USUARIO POR ID
// ==============================
router.get('/:id', auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await obtenerUsuarioPorId(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);

  } catch (error) {
    console.error('ERROR GET USUARIO BY ID:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// ==============================
// 👥 CREAR USUARIO
// ==============================
router.post('/', auth, checkRole([1]), async (req, res) => {
  try {
    const usuario = await crearUsuario(req.body);

    res.json({
      mensaje: 'Usuario creado 👤',
      usuario
    });

  } catch (error) {
    console.error('ERROR CREATE USUARIO:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// ==============================
// 👥 UPDATE USUARIO
// ==============================
router.put('/:id', auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;

    await actualizarUsuario(id, req.body);

    res.json({
      mensaje: 'Usuario actualizado 🔄',
      id
    });

  } catch (error) {
    console.error('ERROR UPDATE USUARIO:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ==============================
// 👥 DELETE (SOFT)
// ==============================
router.delete('/:id', auth, checkRole([1]), async (req, res) => {
  try {
    const { id } = req.params;

    await eliminarUsuario(id);

    res.json({
      mensaje: 'Usuario eliminado (soft delete) 🗑️',
      id
    });

  } catch (error) {
    console.error('ERROR DELETE USUARIO:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;