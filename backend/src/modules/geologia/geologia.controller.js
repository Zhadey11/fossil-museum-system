const service = require('./geologia.service');

const getGeologia = async (req, res) => {
  try {
    const isAdmin = (req.user?.roles || []).includes(1);
    const data = await service.obtenerGeologia({ isAdmin });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGeologia };