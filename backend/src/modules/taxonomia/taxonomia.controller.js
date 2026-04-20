const service = require('./taxonomia.service');

const getTaxonomias = async (req, res) => {
  try {
    const data = await service.obtenerTaxonomias();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTaxonomiaById = async (req, res) => {
  try {
    const data = await service.obtenerTaxonomiaPorId(req.params.id);

    if (!data) {
      return res.status(404).json({ error: 'No encontrada' });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTaxonomia = async (req, res) => {
  try {
    const data = await service.crearTaxonomia(req.body);

    res.json({
      mensaje: 'Taxonomía creada',
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTaxonomia = async (req, res) => {
  try {
    await service.eliminarTaxonomia(req.params.id);

    res.json({ mensaje: 'Eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTaxonomias,
  getTaxonomiaById,
  createTaxonomia,
  deleteTaxonomia
};