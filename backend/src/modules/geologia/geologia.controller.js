const service = require('./geologia.service');

const getGeologia = async (req, res) => {
  try {
    const data = await service.obtenerGeologia();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGeologia };