const express = require("express");
const router = express.Router();
const multer = require("multer");

const auth = require("../../middlewares/auth");
const checkRole = require("../../middlewares/roles");
const controller = require("./multimedia.controller");

const IMAGE_MIME = /^image\/(jpeg|png|gif|webp)$/i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
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

/** Imágenes hasta ~12 MB originales; vídeos hasta 100 MB (sin transcodificar). */
const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: mediaFilter,
});

router.get(
  "/publico/fosil/:fosil_id",
  controller.getMultimediaPublico,
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
