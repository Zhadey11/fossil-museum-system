const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");
const controller = require("./multimedia.controller");

const IMAGE_MIME = /^image\/(jpeg|png|gif|webp|avif)$/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)$/i;
const VIDEO_MIME = /^video\/(mp4|webm|quicktime|x-msvideo|x-matroska)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|mkv)$/i;

const mediaFilter = (_req, file, cb) => {
  const ok =
    IMAGE_MIME.test(file.mimetype) ||
    IMAGE_EXT.test(file.originalname || "") ||
    VIDEO_MIME.test(file.mimetype) ||
    VIDEO_EXT.test(file.originalname || "");
  if (!ok) {
    return cb(
      new Error(
        "Formato no permitido. Imágenes: JPEG, PNG, GIF, WebP. Video: MP4, WebM, MOV.",
      ),
    );
  }
  cb(null, true);
};

const uploadTmpDir = "uploads/tmp";
fs.mkdirSync(uploadTmpDir, { recursive: true });
const uploadMem = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadTmpDir),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: mediaFilter,
});

router.get(
  "/publico/fosil/:fosil_id",
  controller.getMultimediaPublico,
);

router.get(
  "/publico/catalogo",
  controller.getCatalogoPublicoImagenes,
);

router.post(
  "/upload-fosil",
  auth,
  checkRole([1, 3]),
  (req, res, next) => {
    uploadMem.array("files", 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || "Error al subir archivo",
        });
      }
      if (!req.files || req.files.length === 0) {
        uploadMem.single("file")(req, res, (singleErr) => {
          if (singleErr) {
            return res.status(400).json({
              error: singleErr.message || "Error al subir archivo",
            });
          }
          next();
        });
        return;
      }
      next();
    });
  },
  controller.uploadParaFosil,
);

router.get("/fosil/:fosil_id", auth, checkRole([1, 3]), controller.getMultimedia);

router.post("/", auth, checkRole([1]), controller.createMultimedia);

router.delete("/:id", auth, checkRole([1, 3]), controller.deleteMultimedia);

module.exports = router;
