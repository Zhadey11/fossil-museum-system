const generarCodigoFosil = () => {
  return `CR-${Date.now()}`;
};

module.exports = { generarCodigoFosil };