const path = require("path");

/**
 * Raíz del paquete `backend/` (contiene `images/`, `videos/`, `uploads/`).
 * No usar `process.cwd()` para medios: el servidor puede iniciarse desde otra carpeta.
 */
const BACKEND_ROOT = path.join(__dirname, "..", "..");

const IMAGES_DIR = path.join(BACKEND_ROOT, "images");
const VIDEOS_DIR = path.join(BACKEND_ROOT, "videos");
const UPLOADS_DIR = path.join(BACKEND_ROOT, "uploads");

/** Convierte url pública `/images/...` o `/videos/...` en ruta absoluta en disco. */
function diskPathFromPublicUrl(urlPath) {
  if (!urlPath || typeof urlPath !== "string") return null;
  const rel = urlPath.replace(/^\//, "").split("/").join(path.sep);
  return path.join(BACKEND_ROOT, rel);
}

module.exports = {
  BACKEND_ROOT,
  IMAGES_DIR,
  VIDEOS_DIR,
  UPLOADS_DIR,
  diskPathFromPublicUrl,
};
