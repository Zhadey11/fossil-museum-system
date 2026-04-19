const service = require('./ubicacion.service');

const getUbicaciones = async (req, res) => {
  try {
    const data = await service.obtenerUbicaciones();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUbicaciones
};