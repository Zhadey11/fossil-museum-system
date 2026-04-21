const service = require("./fosiles.service");
const invService = require("../investigacion/investigacion.service");

const getFosiles = async (req, res) => {
  try {
    const data = await service.obtenerFosiles(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFosilPublico = async (req, res) => {
  try {
    const data = await service.obtenerFosilPublicoPorId(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Fósil no encontrado" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMapaPublico = async (_req, res) => {
  try {
    const data = await service.obtenerPuntosMapaPublico();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDetalleCompleto = async (req, res) => {
  try {
    const roles = req.user.roles || [];
    const isAdmin = roles.includes(1);
    const isInvestigador = roles.includes(2);

    const data = await service.obtenerDetalleCompleto(req.params.id);

    if (!data) {
      return res.status(404).json({ error: "Fósil no encontrado" });
    }

    if (isInvestigador && !isAdmin) {
      const ok = await invService.investigadorTieneAccesoAFosil(
        req.user.id,
        parseInt(req.params.id, 10),
      );
      if (!ok) {
        return res.status(403).json({
          error:
            "No tenés autorización para el detalle científico de este fósil. Solicitá acceso desde el panel de investigación.",
        });
      }
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createFosil = async (req, res) => {
  try {
    const data = await service.crearFosil(req.body, req.user);

    res.json({
      mensaje: "Fósil creado",
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFosil = async (req, res) => {
  try {
    const roles = req.user.roles || [];
    const isAdmin = roles.includes(1);
    const isExplorador = roles.includes(3);
    if (!isAdmin && !isExplorador) {
      return res.status(403).json({ error: "No autorizado" });
    }
    await service.actualizarFosil(req.params.id, req.body, {
      isAdmin,
      userId: req.user.id,
    });

    res.json({
      mensaje: "Fósil actualizado",
      id: req.params.id,
    });
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message });
  }
};

const deleteFosil = async (req, res) => {
  try {
    await service.eliminarFosil(req.params.id);

    res.json({
      mensaje: "Fósil eliminado (soft delete)",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeEstado = async (req, res) => {
  try {
    const { estado } = req.body;

    const data = await service.cambiarEstadoFosil(req.params.id, estado);

    res.json({
      mensaje: `Estado actualizado a ${estado}`,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMisRegistros = async (req, res) => {
  try {
    const isAdmin = req.user.roles.includes(1);
    const data = isAdmin
      ? await service.obtenerTodosFosilesGestion()
      : await service.obtenerFosilesPorExplorador(req.user.id);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInvestigadorCatalogo = async (req, res) => {
  try {
    const roles = req.user.roles || [];
    const isAdmin = roles.includes(1);
    const data = await service.obtenerFosilesParaInvestigador(
      req.user.id,
      isAdmin,
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getFosiles,
  getMisRegistros,
  getInvestigadorCatalogo,
  getMapaPublico,
  getFosilPublico,
  getDetalleCompleto,
  createFosil,
  updateFosil,
  deleteFosil,
  changeEstado,
};
