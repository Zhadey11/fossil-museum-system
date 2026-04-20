const { pool } = require("../../config/db");

const PUBLIC_COLUMNS = `
  f.id,
  f.codigo_unico,
  f.canton_id,
  f.categoria_id,
  f.era_id,
  f.periodo_id,
  f.taxonomia_id,
  f.explorador_id,
  f.administrador_id,
  f.nombre,
  f.slug,
  f.descripcion_general,
  f.descripcion_detallada,
  f.descripcion_estado_orig,
  f.contexto_geologico,
  CAST(CASE WHEN f.latitud IS NULL THEN NULL ELSE ROUND(f.latitud, 2) END AS DECIMAL(10,7)) AS latitud,
  CAST(CASE WHEN f.longitud IS NULL THEN NULL ELSE ROUND(f.longitud, 2) END AS DECIMAL(10,7)) AS longitud,
  f.altitud_msnm,
  f.descripcion_ubicacion,
  f.estado,
  f.fecha_hallazgo,
  f.fecha_aprobacion,
  f.notas_revision,
  f.created_at,
  f.updated_at,
  CASE WHEN f.latitud IS NOT NULL AND f.longitud IS NOT NULL THEN 1 ELSE 0 END AS tiene_coordenadas
`;

const obtenerFosiles = async (query) => {
  const request = pool.request();
  let sql = `
    SELECT ${PUBLIC_COLUMNS},
      (
        SELECT TOP 1 m.url
        FROM MULTIMEDIA m
        WHERE m.fosil_id = f.id
          AND m.deleted_at IS NULL
          AND m.tipo = 'imagen'
        ORDER BY m.es_principal DESC, m.orden ASC, m.id ASC
      ) AS portada_url
    FROM FOSIL f
    WHERE f.deleted_at IS NULL
  `;

  if (query.estado) {
    sql += ` AND f.estado = @estado`;
    request.input("estado", query.estado);
  } else {
    sql += ` AND f.estado = @estado_default`;
    request.input("estado_default", "publicado");
  }

  if (query.periodo_id) {
    sql += ` AND f.periodo_id = @periodo_id`;
    request.input("periodo_id", parseInt(query.periodo_id, 10));
  }

  if (query.era_id) {
    sql += ` AND f.era_id = @era_id`;
    request.input("era_id", parseInt(query.era_id, 10));
  }

  if (query.categoria_id) {
    sql += ` AND f.categoria_id = @categoria_id`;
    request.input("categoria_id", parseInt(query.categoria_id, 10));
  }

  if (query.q) {
    sql += ` AND (f.nombre LIKE @q OR f.descripcion_general LIKE @q OR f.codigo_unico LIKE @q)`;
    request.input("q", `%${String(query.q).trim()}%`);
  }

  if (query.ubicacion) {
    sql += ` AND (f.descripcion_ubicacion LIKE @ubic OR EXISTS (
      SELECT 1
      FROM CANTON c
      INNER JOIN PROVINCIA p ON p.id = c.provincia_id
      WHERE c.id = f.canton_id
        AND (c.nombre LIKE @ubic OR p.nombre LIKE @ubic OR c.codigo LIKE @ubic OR p.codigo LIKE @ubic)
    ))`;
    request.input("ubic", `%${String(query.ubicacion).trim()}%`);
  }

  sql += " ORDER BY f.created_at DESC";
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 24));
  const offset = (page - 1) * pageSize;
  request.input("offset", offset).input("page_size", pageSize);
  sql += " OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY";

  const result = await request.query(sql);
  return result.recordset;
};

const obtenerFosilPublicoPorId = async (id) => {
  const result = await pool
    .request()
    .input("id", id)
    .query(`
      SELECT ${PUBLIC_COLUMNS},
        (
          SELECT TOP 1 m.url
          FROM MULTIMEDIA m
          WHERE m.fosil_id = f.id
            AND m.deleted_at IS NULL
            AND m.tipo = 'imagen'
          ORDER BY m.es_principal DESC, m.orden ASC, m.id ASC
        ) AS portada_url
      FROM FOSIL f
      WHERE f.id = @id
        AND f.deleted_at IS NULL
        AND f.estado = 'publicado'
    `);

  return result.recordset[0];
};

const obtenerDetalleCompleto = async (id) => {
  const result = await pool
    .request()
    .input("id", id)
    .query(`
      SELECT *
      FROM FOSIL
      WHERE id = @id
        AND deleted_at IS NULL
    `);

  return result.recordset[0];
};

const obtenerFosilMeta = async (id) => {
  const result = await pool
    .request()
    .input("id", id)
    .query(`
      SELECT id, explorador_id, estado, deleted_at
      FROM FOSIL
      WHERE id = @id
    `);
  return result.recordset[0];
};

function slugDesdeNombre(nombre) {
  return `${String(nombre)
    .toLowerCase()
    .replace(/\s+/g, "-")}-${Date.now()}`;
}

/** Campos que el explorador puede editar en sus propios borradores / rechazados / revisión. */
const CAMPOS_EXPLORADOR = [
  "nombre",
  "descripcion_general",
  "descripcion_detallada",
  "descripcion_estado_orig",
  "contexto_geologico",
  "descripcion_ubicacion",
  "latitud",
  "longitud",
  "altitud_msnm",
  "fecha_hallazgo",
  "notas_revision",
];

/** Solo administrador. */
const CAMPOS_ADMIN = [
  "canton_id",
  "categoria_id",
  "era_id",
  "periodo_id",
  "taxonomia_id",
];

const actualizarFosil = async (id, data, ctx) => {
  const { isAdmin, userId } = ctx;
  const meta = await obtenerFosilMeta(id);
  if (!meta || meta.deleted_at) {
    const e = new Error("Fósil no encontrado");
    e.statusCode = 404;
    throw e;
  }
  if (!isAdmin) {
    if (meta.explorador_id !== userId) {
      const e = new Error("Solo podés editar tus propios registros");
      e.statusCode = 403;
      throw e;
    }
    if (!["pendiente", "rechazado", "en_revision"].includes(meta.estado)) {
      const e = new Error(
        "No podés editar un fósil publicado; contactá a un administrador",
      );
      e.statusCode = 403;
      throw e;
    }
  }

  const permitidos = new Set(
    isAdmin ? [...CAMPOS_EXPLORADOR, ...CAMPOS_ADMIN] : CAMPOS_EXPLORADOR,
  );
  const req = pool.request().input("id", id);
  const sets = [];

  for (const key of permitidos) {
    if (data[key] === undefined) continue;
    let val = data[key];
    if (
      key === "latitud" ||
      key === "longitud" ||
      key === "altitud_msnm"
    ) {
      val = val === null || val === "" ? null : Number(val);
    }
    if (
      key === "canton_id" ||
      key === "categoria_id" ||
      key === "era_id" ||
      key === "periodo_id" ||
      key === "taxonomia_id"
    ) {
      val = val === null || val === "" ? null : parseInt(val, 10);
      if (val !== null && Number.isNaN(val)) val = null;
    }
    req.input(key, val);
    sets.push(`${key} = @${key}`);
  }

  if (data.nombre !== undefined) {
    req.input("slug", slugDesdeNombre(data.nombre));
    sets.push("slug = @slug");
  }

  if (sets.length === 0) {
    return;
  }

  sets.push("updated_at = GETDATE()");

  await req.query(`
    UPDATE FOSIL
    SET ${sets.join(", ")}
    WHERE id = @id
  `);
};

const crearFosil = async (data, user) => {
  /* Usar SP oficial para garantizar formato de codigo_unico [PAIS-PROV-CANT-CAT-ID]. */
  const result = await pool
    .request()
    .input("canton_id", data.canton_id)
    .input("categoria_id", data.categoria_id)
    .input("era_id", data.era_id)
    .input("periodo_id", data.periodo_id)
    .input("explorador_id", user.id)
    .input("nombre", data.nombre)
    .input("descripcion_general", data.descripcion_general || "Pendiente de revisión")
    .input("latitud", data.latitud ?? null)
    .input("longitud", data.longitud ?? null)
    .input("altitud_msnm", data.altitud_msnm ?? null)
    .input("descripcion_ubicacion", data.descripcion_ubicacion ?? null)
    .input("fecha_hallazgo", data.fecha_hallazgo ?? null)
    .query(`
      DECLARE @nuevo_id INT, @nuevo_codigo VARCHAR(30);
      EXEC sp_registrar_fosil
        @canton_id = @canton_id,
        @categoria_id = @categoria_id,
        @era_id = @era_id,
        @periodo_id = @periodo_id,
        @explorador_id = @explorador_id,
        @nombre = @nombre,
        @descripcion_general = @descripcion_general,
        @latitud = @latitud,
        @longitud = @longitud,
        @altitud_msnm = @altitud_msnm,
        @descripcion_ubicacion = @descripcion_ubicacion,
        @fecha_hallazgo = @fecha_hallazgo,
        @nuevo_id = @nuevo_id OUTPUT,
        @nuevo_codigo = @nuevo_codigo OUTPUT;
      SELECT @nuevo_id AS id, @nuevo_codigo AS codigo_unico;
    `);

  const row = result.recordset?.[0] || {};
  return { id: row.id, codigo_unico: row.codigo_unico };
};

const eliminarFosil = async (id) => {
  await pool
    .request()
    .input("id", id)
    .query(`
      UPDATE FOSIL
      SET deleted_at = GETDATE()
      WHERE id = @id
    `);
};

const cambiarEstadoFosil = async (id, estado) => {
  await pool
    .request()
    .input("id", id)
    .input("estado", estado)
    .query(`
      UPDATE FOSIL
      SET estado = @estado
      WHERE id = @id
    `);

  return { id, estado };
};

const obtenerFosilesPorExplorador = async (exploradorId) => {
  const result = await pool
    .request()
    .input("explorador_id", exploradorId)
    .query(`
      SELECT *
      FROM FOSIL
      WHERE explorador_id = @explorador_id
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `);

  return result.recordset;
};

const obtenerTodosFosilesGestion = async () => {
  const result = await pool.request().query(`
    SELECT *
    FROM FOSIL
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `);

  return result.recordset;
};

/** Catálogo para investigación: admin ve amplio listado; investigador solo fósiles autorizados. */
const obtenerFosilesParaInvestigador = async (investigadorId, isAdmin) => {
  if (isAdmin) {
    const result = await pool.request().query(`
      SELECT *
      FROM FOSIL
      WHERE deleted_at IS NULL
        AND estado IN ('publicado', 'en_revision', 'pendiente')
      ORDER BY updated_at DESC
    `);
    return result.recordset;
  }

  const result = await pool
    .request()
    .input("inv", investigadorId)
    .query(`
      SELECT f.*
      FROM FOSIL f
      INNER JOIN INVESTIGADOR_FOSIL_AUTORIZADO a
        ON a.fosil_id = f.id AND a.investigador_id = @inv
      WHERE f.deleted_at IS NULL
      ORDER BY f.updated_at DESC
    `);

  return result.recordset;
};

module.exports = {
  obtenerFosiles,
  obtenerFosilPublicoPorId,
  obtenerDetalleCompleto,
  obtenerFosilesPorExplorador,
  obtenerTodosFosilesGestion,
  obtenerFosilesParaInvestigador,
  crearFosil,
  actualizarFosil,
  eliminarFosil,
  cambiarEstadoFosil,
};
