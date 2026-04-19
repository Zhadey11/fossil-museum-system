const service = require('./fosiles.service');

// ==============================
// 🦴 GET FÓSILES
// ==============================
const getFosiles = async (req, res) => {
  try {
    const data = await service.obtenerFosiles(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 GET POR ID
// ==============================
const getFosilById = async (req, res) => {
  try {
    const data = await service.obtenerFosilPorId(req.params.id);

    if (!data) {
      return res.status(404).json({ error: 'Fósil no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 DETALLE COMPLETO
// ==============================
const getDetalleCompleto = async (req, res) => {
  try {
    const data = await service.obtenerDetalleCompleto(req.params.id);

    if (!data) {
      return res.status(404).json({ error: 'Fósil no encontrado' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 CREAR
// ==============================
const createFosil = async (req, res) => {
  try {
    const data = await service.crearFosil(req.body, req.user);

    res.json({
      mensaje: 'Fósil creado 🦴',
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 UPDATE
// ==============================
const updateFosil = async (req, res) => {
  try {
    await service.actualizarFosil(req.params.id, req.body);

    res.json({
      mensaje: 'Fósil actualizado 🔄',
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 DELETE (SOFT)
// ==============================
const deleteFosil = async (req, res) => {
  try {
    await service.eliminarFosil(req.params.id);

    res.json({
      mensaje: 'Fósil eliminado (soft) 🗑️'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 CAMBIAR ESTADO (ADMIN)
// ==============================
const changeEstado = async (req, res) => {
  try {
    const { estado } = req.body;

    const data = await service.cambiarEstadoFosil(req.params.id, estado);

    res.json({
      mensaje: `Estado actualizado a ${estado} 🔄`,
      data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// 🦴 VER PENDIENTES (ADMIN)
// ==============================
const getPendientes = async (req, res) => {
  try {
    const data = await service.obtenerFosilesPendientes();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==============================
// EXPORTS
// ==============================
module.exports = {
  getFosiles,
  getFosilById,
  getDetalleCompleto,
  getPendientes,
  createFosil,
  updateFosil,
  deleteFosil,
  changeEstado
};