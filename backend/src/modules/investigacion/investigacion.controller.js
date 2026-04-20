const service = require("./investigacion.service");

const crearSolicitud = async (req, res) => {
  try {
    const data = await service.crearSolicitud(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message });
  }
};

const listarMisSolicitudes = async (req, res) => {
  try {
    const data = await service.listarMisSolicitudes(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listarPendientesAdmin = async (req, res) => {
  try {
    const data = await service.listarSolicitudesPendientesAdmin();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const aprobar = async (req, res) => {
  try {
    const data = await service.aprobarSolicitud(
      parseInt(req.params.id, 10),
      req.user.id,
    );
    res.json(data);
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message });
  }
};

const rechazar = async (req, res) => {
  try {
    const data = await service.rechazarSolicitud(
      parseInt(req.params.id, 10),
      req.user.id,
      req.body?.nota,
    );
    res.json(data);
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message });
  }
};

module.exports = {
  crearSolicitud,
  listarMisSolicitudes,
  listarPendientesAdmin,
  aprobar,
  rechazar,
};
