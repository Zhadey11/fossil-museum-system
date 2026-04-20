const service = require("./catalogos.service");

const getCatalogosFormularioFosil = async (req, res) => {
  try {
    const data = await service.obtenerCatalogosFormularioFosil();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCatalogosFormularioFosil };
