const service = require('./multimedia.service');

// GET
const getMultimedia = async (req, res) => {
  try {
    const data = await service.obtenerMultimedia(req.params.fosil_id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST
const createMultimedia = async (req, res) => {
  try {
    const data = await service.crearMultimedia(req.body);

    res.json({
      mensaje: 'Multimedia agregada 📸',
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const deleteMultimedia = async (req, res) => {
  try {
    await service.eliminarMultimedia(req.params.id);

    res.json({
      mensaje: 'Multimedia eliminada 🗑️'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMultimedia,
  createMultimedia,
  deleteMultimedia
};