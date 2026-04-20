const {
  aprobarFosil,
  rechazarFosil,
  obtenerPendientes
} = require('./admin.service');

const aprobar = async (req, res) => {
  try {
    const data = await aprobarFosil(req.params.id, req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
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

module.exports = {
  aprobar,
  rechazar,
  pendientes
};