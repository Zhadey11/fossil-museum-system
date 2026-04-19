const service = require('./contacto.service');

const sendMensaje = async (req, res) => {
  try {
    const data = await service.enviarMensaje(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMensaje };