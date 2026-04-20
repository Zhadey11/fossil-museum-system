const service = require('./estudios.service');

const getEstudios = async (req, res) => {
  try {
    const data = await service.obtenerEstudios(req.query || {}, req.user || {});
    res.json(data);
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message });
  }
};

module.exports = {
  getEstudios
};