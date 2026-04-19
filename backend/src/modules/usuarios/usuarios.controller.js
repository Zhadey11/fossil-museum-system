const service = require('./usuarios.service');

// GET
const getUsuarios = async (req, res) => {
  try {
    const data = await service.obtenerUsuarios();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ID
const getUsuarioById = async (req, res) => {
  try {
    const data = await service.obtenerUsuarioPorId(req.params.id);

    if (!data) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST
const createUsuario = async (req, res) => {
  try {
    const data = await service.crearUsuario(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const deleteUsuario = async (req, res) => {
  try {
    await service.eliminarUsuario(req.params.id);
    res.json({ mensaje: 'Usuario eliminado (soft delete)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  deleteUsuario
};