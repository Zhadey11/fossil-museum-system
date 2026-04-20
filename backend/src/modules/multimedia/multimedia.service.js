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

/** Catálogo público por imagen: devuelve TODAS las imágenes publicadas con datos básicos del fósil. */
const obtenerCatalogoPublicoImagenes = async (query) => {
  const request = pool.request();
  let whereSql = `
    WHERE m.deleted_at IS NULL
      AND f.deleted_at IS NULL
      AND f.estado = 'publicado'
      AND m.tipo = 'imagen'
  `;
  if (query.periodo_id) {
    whereSql += " AND f.periodo_id = @periodo_id";
    request.input("periodo_id", parseInt(query.periodo_id, 10));
  }
  if (query.era_id) {
    whereSql += " AND f.era_id = @era_id";
    request.input("era_id", parseInt(query.era_id, 10));
  }
  if (query.categoria_id) {
    whereSql += " AND f.categoria_id = @categoria_id";
    request.input("categoria_id", parseInt(query.categoria_id, 10));
  }
  if (query.q) {
    whereSql += " AND (f.nombre LIKE @q OR f.descripcion_general LIKE @q OR f.codigo_unico LIKE @q OR m.url LIKE @q)";
    request.input("q", `%${String(query.q).trim()}%`);
  }
  if (query.ubicacion) {
    whereSql += ` AND (f.descripcion_ubicacion LIKE @ubic OR EXISTS (
      SELECT 1
      FROM CANTON c
      INNER JOIN PROVINCIA p ON p.id = c.provincia_id
      WHERE c.id = f.canton_id
        AND (c.nombre LIKE @ubic OR p.nombre LIKE @ubic OR c.codigo LIKE @ubic OR p.codigo LIKE @ubic)
    ))`;
    request.input("ubic", `%${String(query.ubicacion).trim()}%`);
  }
  if (query.subtipo) {
    whereSql += " AND m.subtipo = @subtipo";
    request.input("subtipo", String(query.subtipo).trim());
  }
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 24));
  const offset = (page - 1) * pageSize;
  request.input("offset", offset).input("fetch_size", pageSize + 1);

  const selectSql = `
    SELECT
      m.id AS multimedia_id,
      m.url AS imagen_url,
      m.subtipo,
      m.descripcion AS imagen_descripcion,
      f.id,
      f.nombre,
      f.codigo_unico,
      f.descripcion_general,
      f.categoria_id,
      cf.codigo AS categoria_codigo,
      cf.nombre AS categoria_nombre,
      eg.nombre AS era_nombre,
      pg.nombre AS periodo_nombre
    FROM MULTIMEDIA m
    INNER JOIN FOSIL f ON f.id = m.fosil_id
    LEFT JOIN CATEGORIA_FOSIL cf ON cf.id = f.categoria_id
    LEFT JOIN ERA_GEOLOGICA eg ON eg.id = f.era_id
    LEFT JOIN PERIODO_GEOLOGICO pg ON pg.id = f.periodo_id
    ${whereSql}
    ORDER BY f.created_at DESC, m.es_principal DESC, m.orden ASC, m.id ASC
    OFFSET @offset ROWS FETCH NEXT @fetch_size ROWS ONLY
  `;
  const result = await request.query(selectSql);
  const rows = result.recordset || [];
  const hasNext = rows.length > pageSize;
  const items = hasNext ? rows.slice(0, pageSize) : rows;

  const includeTotal =
    query.include_total === "1" ||
    query.include_total === "true" ||
    query.include_total === 1 ||
    query.include_total === true;
  let total = null;
  if (includeTotal) {
    const countRequest = pool.request();
    if (query.periodo_id) countRequest.input("periodo_id", parseInt(query.periodo_id, 10));
    if (query.era_id) countRequest.input("era_id", parseInt(query.era_id, 10));
    if (query.categoria_id) countRequest.input("categoria_id", parseInt(query.categoria_id, 10));
    if (query.q) countRequest.input("q", `%${String(query.q).trim()}%`);
    if (query.ubicacion) countRequest.input("ubic", `%${String(query.ubicacion).trim()}%`);
    if (query.subtipo) countRequest.input("subtipo", String(query.subtipo).trim());
    const countSql = `
      SELECT COUNT(1) AS total
      FROM MULTIMEDIA m
      INNER JOIN FOSIL f ON f.id = m.fosil_id
      LEFT JOIN CATEGORIA_FOSIL cf ON cf.id = f.categoria_id
      LEFT JOIN ERA_GEOLOGICA eg ON eg.id = f.era_id
      LEFT JOIN PERIODO_GEOLOGICO pg ON pg.id = f.periodo_id
      ${whereSql}
    `;
    const countResult = await countRequest.query(countSql);
    total = Number(countResult.recordset?.[0]?.total ?? 0);
  }

  return {
    items,
    page,
    page_size: pageSize,
    has_next: hasNext,
    total,
  };
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
  obtenerCatalogoPublicoImagenes,
  contarMultimediaActiva,
  obtenerMultimediaPorId,
  crearMultimedia,
  eliminarMultimedia,
  assertAccesoFosil,
  formatoDesdeNombre,
  borrarArchivoFisico,
};
