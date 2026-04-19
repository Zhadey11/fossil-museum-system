const service = require('./estudios.service');

const getEstudios = async (req, res) => {
  try {
    const data = await service.obtenerEstudios();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEstudios
};