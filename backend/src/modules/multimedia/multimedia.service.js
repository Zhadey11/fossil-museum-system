const fs = require("fs");
const path = require("path");
const { pool } = require("../../config/db");

const SUBTIPOS_VALIDOS = new Set([
  "antes",
  "despues",
  "analisis",
  "general",
  "portada",
  "reconstruccion",
  "escaneo",
]);

const obtenerFosilExplorador = async (fosilId) => {
  const r = await pool
    .request()
    .input("id", fosilId)
    .query(`
      SELECT id, explorador_id, estado
      FROM FOSIL
      WHERE id = @id AND deleted_at IS NULL
    `);
  return r.recordset[0];
};

/** Devuelve el fósil si hay permiso (admin o explorador dueño). */
const assertAccesoFosil = async (user, fosilId) => {
  const fosil = await obtenerFosilExplorador(fosilId);
  if (!fosil) {
    const err = new Error("Fósil no encontrado");
    err.statusCode = 404;
    throw err;
  }
  const roles = user.roles || [];
  if (roles.includes(1)) return fosil;
  if (roles.includes(3) && fosil.explorador_id === user.id) return fosil;
  const err = new Error("No autorizado");
  err.statusCode = 403;
  throw err;
};

const contarMultimediaActiva = async (fosil_id) => {
  const r = await pool
    .request()
    .input("fosil_id", fosil_id)
    .query(`
      SELECT COUNT(*) AS n
      FROM MULTIMEDIA
      WHERE fosil_id = @fosil_id AND deleted_at IS NULL
    `);
  return r.recordset[0]?.n ?? 0;
};

const obtenerMultimedia = async (fosil_id) => {
  const result = await pool
    .request()
    .input("fosil_id", fosil_id)
    .query(`
      SELECT id, url, tipo, subtipo, nombre_archivo, descripcion, es_principal, orden
      FROM MULTIMEDIA
      WHERE fosil_id = @fosil_id
        AND deleted_at IS NULL
      ORDER BY es_principal DESC, orden ASC, id ASC
    `);

  return result.recordset;
};

/** Solo fósiles publicados (sitio público). Misma selección que listado autenticado. */
const obtenerMultimediaPublico = async (fosil_id) => {
  const chk = await pool
    .request()
    .input("id", fosil_id)
    .query(`
      SELECT 1 AS ok
      FROM FOSIL
      WHERE id = @id
        AND deleted_at IS NULL
        AND estado = 'publicado'
    `);
  if (!chk.recordset.length) {
    return [];
  }
  return obtenerMultimedia(fosil_id);
};

const obtenerMultimediaPorId = async (id) => {
  const r = await pool
    .request()
    .input("id", id)
    .query(`
      SELECT m.id, m.fosil_id, m.url, m.tipo
      FROM MULTIMEDIA m
      WHERE m.id = @id AND m.deleted_at IS NULL
    `);
  return r.recordset[0];
};

const crearMultimedia = async (data) => {
  const subtipo = SUBTIPOS_VALIDOS.has(data.subtipo)
    ? data.subtipo
    : "general";
  const result = await pool
    .request()
    .input("fosil_id", data.fosil_id)
    .input("tipo", data.tipo || "imagen")
    .input("subtipo", subtipo)
    .input("url", data.url)
    .input("nombre_archivo", data.nombre_archivo)
    .input("formato", data.formato || null)
    .input("descripcion", data.descripcion ?? null)
    .input("angulo", data.angulo ?? null)
    .input("es_principal", data.es_principal ? 1 : 0)
    .input("orden", data.orden ?? 0)
    .input("tamano_bytes", data.tamano_bytes ?? null)
    .query(`
      INSERT INTO MULTIMEDIA (
        fosil_id,
        tipo,
        subtipo,
        url,
        nombre_archivo,
        formato,
        descripcion,
        angulo,
        es_principal,
        orden,
        tamano_bytes
      )
      VALUES (
        @fosil_id,
        @tipo,
        @subtipo,
        @url,
        @nombre_archivo,
        @formato,
        @descripcion,
        @angulo,
        @es_principal,
        @orden,
        @tamano_bytes
      );
      SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
    `);

  return result.recordset[0];
};

const eliminarMultimedia = async (id) => {
  await pool
    .request()
    .input("id", id)
    .query(`
      UPDATE MULTIMEDIA
      SET deleted_at = GETDATE()
      WHERE id = @id
    `);

  return { id };
};

/** Rutas servidas por Express → archivo en disco. */
function borrarArchivoFisico(urlPath) {
  if (!urlPath || typeof urlPath !== "string") return;
  if (
    !urlPath.startsWith("/images/") &&
    !urlPath.startsWith("/videos/") &&
    !urlPath.startsWith("/uploads/")
  ) {
    return;
  }
  const rel = urlPath.replace(/^\//, "");
  const abs = path.join(process.cwd(), rel);
  fs.unlink(abs, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("[multimedia] unlink:", abs, err.message);
    }
  });
}

function formatoDesdeNombre(original) {
  const e = path.extname(original).replace(".", "").toLowerCase();
  if (!e) return null;
  if (e === "jpg") return "jpeg";
  return e;
}

module.exports = {
  obtenerMultimedia,
  obtenerMultimediaPublico,
  contarMultimediaActiva,
  obtenerMultimediaPorId,
  crearMultimedia,
  eliminarMultimedia,
  assertAccesoFosil,
  formatoDesdeNombre,
  borrarArchivoFisico,
};
