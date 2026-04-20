const service = require('./contacto.service');

const sendMensaje = async (req, res) => {
  try {
    const data = await service.enviarMensaje(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarMensajes = async (_req, res) => {
  try {
    const data = await service.obtenerMensajes();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error al listar mensajes" });
  }
};

module.exports = { sendMensaje, listarMensajes };