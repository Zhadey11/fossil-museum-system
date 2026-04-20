const sharp = require("sharp");

/** Lado máximo en px (la imagen encaja dentro sin recortar). */
const MAX_EDGE = 1920;
const WEBP_QUALITY = 82;

/**
 * Rota según EXIF, redimensiona si hace falta y guarda como WebP (menos peso).
 * @param {Buffer} buffer
 * @returns {Promise<Buffer>}
 */
async function optimizarParaGuardar(buffer) {
  return sharp(buffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

module.exports = {
  optimizarParaGuardar,
  MAX_EDGE,
};
