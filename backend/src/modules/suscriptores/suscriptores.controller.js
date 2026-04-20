const service = require("./suscriptores.service");

const crearSuscripcion = async (req, res) => {
  try {
    const data = await service.suscribir(req.body?.correo);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message || "No se pudo suscribir" });
  }
};

const listarSuscriptores = async (req, res) => {
  try {
    const data = await service.listar();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "No se pudo listar" });
  }
};

const actualizarSuscriptor = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID inválido" });
    const data = await service.cambiarActivo(id, !!req.body?.activo);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "No se pudo actualizar" });
  }
};

const eliminarSuscriptor = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: "ID inválido" });
    const data = await service.eliminar(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "No se pudo eliminar" });
  }
};

const historial = async (req, res) => {
  try {
    const data = await service.historial();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "No se pudo listar" });
  }
};

module.exports = {
  crearSuscripcion,
  listarSuscriptores,
  actualizarSuscriptor,
  eliminarSuscriptor,
  historial,
};
