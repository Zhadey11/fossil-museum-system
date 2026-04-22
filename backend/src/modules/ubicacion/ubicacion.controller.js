const service = require('./ubicacion.service');

const getUbicaciones = async (req, res) => {
  try {
    const isAdmin = (req.user?.roles || []).includes(1);
    const data = await service.obtenerUbicaciones({ isAdmin });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUbicaciones
};