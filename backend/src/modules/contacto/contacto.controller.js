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

const marcarLeido = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const leido = Boolean(req.body?.leido);
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await service.marcarLeido(id, leido);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Error al marcar leído" });
  }
};

const eliminarMensaje = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await service.eliminarMensaje(id);
    res.json({ mensaje: "Mensaje eliminado", ...data });
  } catch (error) {
    res.status(500).json({ error: error.message || "Error al eliminar mensaje" });
  }
};

module.exports = { sendMensaje, listarMensajes, marcarLeido, eliminarMensaje };