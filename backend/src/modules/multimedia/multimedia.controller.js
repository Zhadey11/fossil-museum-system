const crypto = require("crypto");
const fs = require("fs");
const { IMAGES_DIR, VIDEOS_DIR } = require("../../config/paths");
const path = require("path");
const { optimizarParaGuardar } = require("./multimedia.image");
const service = require("./multimedia.service");
const suscriptoresService = require("../suscriptores/suscriptores.service");

function isVideoFile(file) {
  if (!file) return false;
  if (/^video\//i.test(file.mimetype || "")) return true;
  return /\.(mp4|webm|mov|mkv)$/i.test(file.originalname || "");
}

function videoExtension(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if ([".mp4", ".webm", ".mov", ".mkv"].includes(ext)) return ext;
  const mt = (file.mimetype || "").toLowerCase();
  if (mt === "video/mp4") return ".mp4";
  if (mt === "video/webm") return ".webm";
  if (mt === "video/quicktime") return ".mov";
  if (mt === "video/x-matroska") return ".mkv";
  return ".mp4";
}

function formatoDesdeExtension(ext) {
  const s = ext.replace(".", "").toLowerCase();
  if (s === "jpg") return "jpeg";
  return s || null;
}

function carpetaImagenPorCategoriaId(categoriaId) {
  const id = Number(categoriaId);
  if (id === 4) return "paleontologico-especifico";
  if (id === 2) return "minerales";
  if (id === 3) return "rocas";
  return "generales";
}

function readUploadedFile(file) {
  if (file?.buffer) return file.buffer;
  if (file?.path && fs.existsSync(file.path)) {
    return fs.readFileSync(file.path);
  }
  return null;
}

function cleanupTempFile(file) {
  if (!file?.path) return;
  try {
    fs.unlinkSync(file.path);
  } catch {
    /* ignore */
  }
}

const getMultimedia = async (req, res) => {
  try {
    const fosilId = parseInt(req.params.fosil_id, 10);
    if (!fosilId) {
      return res.status(400).json({ error: "ID inválido" });
    }
    await service.assertAccesoFosil(req.user, fosilId);
    const data = await service.obtenerMultimedia(fosilId);
    res.json(data);
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({
      error: error.message || "Error al listar multimedia",
    });
  }
};

/** Sin autenticación: solo fósiles en estado publicado (galería pública). */
const getMultimediaPublico = async (req, res) => {
  try {
    const fosilId = parseInt(req.params.fosil_id, 10);
    if (!fosilId) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await service.obtenerMultimediaPublico(fosilId);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al listar multimedia",
    });
  }
};

const getCatalogoPublicoImagenes = async (req, res) => {
  try {
    const data = await service.obtenerCatalogoPublicoImagenes(req.query || {});
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error al listar catálogo público",
    });
  }
};

const createMultimedia = async (req, res) => {
  try {
    const body = req.body || {};
    const fosil_id = parseInt(body.fosil_id, 10);
    if (!fosil_id || !body.url || !body.nombre_archivo) {
      return res.status(400).json({
        error: "fosil_id, url y nombre_archivo son obligatorios",
      });
    }
    await service.assertAccesoFosil(req.user, fosil_id);
    const data = await service.crearMultimedia({
      fosil_id,
      tipo: body.tipo || "imagen",
      subtipo: body.subtipo,
      url: body.url,
      nombre_archivo: body.nombre_archivo,
      formato: body.formato,
      descripcion: body.descripcion,
      angulo: body.angulo,
      es_principal: !!body.es_principal,
      orden: body.orden != null ? parseInt(body.orden, 10) : 0,
      tamano_bytes: body.tamano_bytes,
    });

    res.json({
      mensaje: "Multimedia agregada",
      data,
    });
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message || "Error" });
  }
};

/**
 * Fotos: redimensiona y WebP en /images/{pending|fossiles}/.
 * Vídeos: sin transcodificar en /videos/{pending|fossiles}/.
 */
const uploadParaFosil = async (req, res) => {
  try {
    const files = Array.isArray(req.files) && req.files.length > 0
      ? req.files
      : req.file
        ? [req.file]
        : [];
    if (files.length === 0) {
      return res.status(400).json({ error: "Seleccioná un archivo" });
    }
    const fosil_id = parseInt(req.body.fosil_id, 10);
    if (!fosil_id) {
      return res.status(400).json({ error: "fosil_id requerido" });
    }
    const fosil = await service.assertAccesoFosil(req.user, fosil_id);
    const imageSubdir =
      fosil.estado === "pendiente"
        ? "pending"
        : path.join("fossiles", carpetaImagenPorCategoriaId(fosil.categoria_id));
    const videoSubdir = fosil.estado === "pendiente" ? "pending" : "fossiles";

    const uploaded = [];
    for (const file of files) {
      const video = isVideoFile(file);
      const inputBuffer = readUploadedFile(file);
      if (!inputBuffer) {
        cleanupTempFile(file);
        return res.status(400).json({ error: "No se pudo leer el archivo subido" });
      }
      let absPath;
      let url;
      let tipoMultimedia;
      let formato;
      let tamanoBytes;
      let nombreArchivo = file.originalname || "";

      if (video) {
        const ext = videoExtension(file);
        const baseName = `fosil_${fosil_id}_${crypto.randomUUID()}${ext}`;
        const absDir = path.join(VIDEOS_DIR, videoSubdir);
        fs.mkdirSync(absDir, { recursive: true });
        absPath = path.join(absDir, baseName);
        fs.writeFileSync(absPath, inputBuffer);
        url = `/videos/${videoSubdir.replaceAll(path.sep, "/")}/${baseName}`;
        tipoMultimedia = "video";
        formato = formatoDesdeExtension(ext);
        tamanoBytes = inputBuffer.length;
      } else {
        let procesado;
        try {
          procesado = await optimizarParaGuardar(inputBuffer);
        } catch {
          cleanupTempFile(file);
          return res.status(400).json({
            error:
              "No se pudo procesar la imagen. Comprobá que sea un archivo válido.",
          });
        }
        const baseName = `fosil_${fosil_id}_${crypto.randomUUID()}.webp`;
        const absDir = path.join(IMAGES_DIR, imageSubdir);
        fs.mkdirSync(absDir, { recursive: true });
        absPath = path.join(absDir, baseName);
        fs.writeFileSync(absPath, procesado);
        url = `/images/${imageSubdir.replaceAll(path.sep, "/")}/${baseName}`;
        tipoMultimedia = "imagen";
        formato = "webp";
        tamanoBytes = procesado.length;
      }

      const esPrimera = (await service.contarMultimediaActiva(fosil_id)) === 0;

      let data;
      try {
        data = await service.crearMultimedia({
          fosil_id,
          tipo: tipoMultimedia,
          subtipo: req.body.subtipo,
          url,
          nombre_archivo: nombreArchivo || path.basename(url),
          formato,
          descripcion: req.body.descripcion || null,
          tamano_bytes: tamanoBytes,
          es_principal: esPrimera,
          orden: esPrimera ? 0 : undefined,
        });
      } catch (dbErr) {
        cleanupTempFile(file);
        try {
          fs.unlinkSync(absPath);
        } catch {
          /* ignore */
        }
        throw dbErr;
      }
      uploaded.push({ id: data.id, url, tipo: tipoMultimedia });
      cleanupTempFile(file);
    }

    res.json({
      message: uploaded.length > 1 ? "Archivos subidos" : "Archivo subido",
      uploads: uploaded,
      id: uploaded[0]?.id,
      url: uploaded[0]?.url,
      tipo: uploaded[0]?.tipo,
    });
    if (uploaded.some((u) => u.tipo === "imagen") && req.user?.rol_id === 1) {
      await suscriptoresService.notificarActivos({
        tipo: "galeria_actualizada",
        titulo: "Nueva imagen en la galería",
        cuerpo: "Se agregaron nuevas imágenes a la galería del museo.",
      });
    }
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({
      error: error.message || "Error al subir archivo",
    });
  }
};

const deleteMultimedia = async (req, res) => {
  try {
    const row = await service.obtenerMultimediaPorId(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Registro no encontrado" });
    }
    await service.assertAccesoFosil(req.user, row.fosil_id);
    const urlArchivo = row.url;
    await service.eliminarMultimedia(req.params.id);
    service.borrarArchivoFisico(urlArchivo);
    res.json({ message: "Multimedia eliminada", mensaje: "Multimedia eliminada" });
  } catch (error) {
    const code = error.statusCode || 500;
    res.status(code).json({ error: error.message || "Error al eliminar" });
  }
};

module.exports = {
  getMultimedia,
  getMultimediaPublico,
  getCatalogoPublicoImagenes,
  createMultimedia,
  uploadParaFosil,
  deleteMultimedia,
};
