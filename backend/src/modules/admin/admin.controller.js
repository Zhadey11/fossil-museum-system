const {
  aprobarFosil,
  rechazarFosil,
  obtenerPendientes,
  obtenerPapelera,
  restaurarUsuarioPapelera,
  restaurarFosilPapelera,
  restaurarContactoPapelera,
} = require('./admin.service');

const aprobar = async (req, res) => {
  try {
    const data = await aprobarFosil(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || "Error al aprobar fósil",
    });
  }
};

const rechazar = async (req, res) => {
  try {
    const data = await rechazarFosil(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al rechazar fósil",
    });
  }
};

const pendientes = async (req, res) => {
  try {
    const data = await obtenerPendientes();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al obtener pendientes",
    });
  }
};

const papelera = async (_req, res) => {
  try {
    const data = await obtenerPapelera();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al obtener papelera",
    });
  }
};

const restaurarUsuario = async (req, res) => {
  try {
    const data = await restaurarUsuarioPapelera(parseInt(req.params.id, 10));
    res.json({ mensaje: "Usuario restaurado", ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Error al restaurar usuario" });
  }
};

const restaurarFosil = async (req, res) => {
  try {
    const data = await restaurarFosilPapelera(parseInt(req.params.id, 10));
    res.json({ mensaje: "Fósil restaurado", ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Error al restaurar fósil" });
  }
};

const restaurarContacto = async (req, res) => {
  try {
    const data = await restaurarContactoPapelera(parseInt(req.params.id, 10));
    res.json({ mensaje: "Mensaje restaurado", ...data });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Error al restaurar mensaje" });
  }
};

module.exports = {
  aprobar,
  rechazar,
  pendientes,
  papelera,
  restaurarUsuario,
  restaurarFosil,
  restaurarContacto,
};