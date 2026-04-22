const { pool } = require("../../config/db");

async function obtenerOCrearTaxonomiaId(data) {
  const reino = String(data.reino || "").trim();
  const filo = String(data.filo || "").trim();
  const clase = String(data.clase || "").trim();
  const orden = String(data.orden || "").trim();
  const familia = String(data.familia || "").trim();
  const genero = String(data.genero || "").trim();
  const especie = String(data.especie || "").trim();
  if (!reino || !filo || !clase || !orden || !familia || !genero || !especie) return null;
  const found = await pool
    .request()
    .input("reino", reino)
    .input("filo", filo)
    .input("clase", clase)
    .input("orden", orden)
    .input("familia", familia)
    .input("genero", genero)
    .input("especie", especie)
    .query(`
      SELECT TOP 1 id
      FROM TAXONOMIA
      WHERE reino = @reino
        AND filo = @filo
        AND clase = @clase
        AND orden = @orden
        AND familia = @familia
        AND genero = @genero
        AND especie = @especie
    `);
  if (found.recordset?.[0]?.id) return Number(found.recordset[0].id);
  const created = await pool
    .request()
    .input("reino", reino)
    .input("filo", filo)
    .input("clase", clase)
    .input("orden", orden)
    .input("familia", familia)
    .input("genero", genero)
    .input("especie", especie)
    .query(`
      INSERT INTO TAXONOMIA (reino, filo, clase, orden, familia, genero, especie)
      VALUES (@reino, @filo, @clase, @orden, @familia, @genero, @especie);
      SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;
    `);
  return Number(created.recordset?.[0]?.id || 0) || null;
}

const PUBLIC_COLUMNS = `
  f.id,
  f.canton_id,
  f.categoria_id,
  f.era_id,
  f.periodo_id,
  f.nombre,
  f.nombre_comun,
  f.nombre_cientifico,
  f.slug,
  cf.codigo AS categoria_codigo,
  cf.nombre AS categoria_nombre,
  eg.nombre AS era_nombre,
  pg.nombre AS periodo_nombre,
  f.descripcion_general,
  f.descripcion_ubicacion,
  f.estado,
  f.fecha_hallazgo,
  f.created_at,
  ex.nombre AS explorador_nombre,
  ex.apellido AS explorador_apellido,
  COALESCE(
    NULLIF(LTRIM(RTRIM(CONCAT(prov.nombre, N', ', pa.nombre))), N''),
    NULLIF(LTRIM(RTRIM(CONCAT_WS(N' · ', prov.nombre, cant.nombre))), N''),
    f.descripcion_ubicacion
  ) AS ubicacion,
  f.cantera_sitio,
  NULLIF(LTRIM(RTRIM(CONCAT(ex.nombre, N' ', ex.apellido))), N'') AS explorador_publico
`;

const PUBLIC_FROM = `
    FROM FOSIL f
    LEFT JOIN CATEGORIA_FOSIL cf ON cf.id = f.categoria_id
    LEFT JOIN ERA_GEOLOGICA eg ON eg.id = f.era_id
    LEFT JOIN PERIODO_GEOLOGICO pg ON pg.id = f.periodo_id
    LEFT JOIN USUARIO ex ON ex.id = f.explorador_id AND ex.deleted_at IS NULL
    LEFT JOIN CANTON cant ON cant.id = f.canton_id
    LEFT JOIN PROVINCIA prov ON prov.id = cant.provincia_id
    LEFT JOIN PAIS pa ON pa.id = prov.pais_id
`;

const obtenerFosiles = async (query) => {
  const request = pool.request();
  let sql = `
    SELECT ${PUBLIC_COLUMNS},
      COUNT(1) OVER() AS total_count,
      (
        SELECT TOP 1 m.url
        FROM MULTIMEDIA m
        WHERE m.fosil_id = f.id
          AND m.deleted_at IS NULL
          AND m.tipo = 'imagen'
        ORDER BY m.es_principal DESC, m.orden ASC, m.id ASC
      ) AS portada_url
    ${PUBLIC_FROM}
    WHERE f.deleted_at IS NULL
  `;

  sql += ` AND f.estado = @estado_default`;
  request.input("estado_default", "publicado");

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
    sql += ` AND (
      f.nombre LIKE @q OR f.descripcion_general LIKE @q
      OR (f.nombre_comun IS NOT NULL AND f.nombre_comun LIKE @q)
      OR (f.nombre_cientifico IS NOT NULL AND f.nombre_cientifico LIKE @q)
    )`;
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
      ${PUBLIC_FROM}
      WHERE f.id = @id
        AND f.deleted_at IS NULL
        AND f.estado = 'publicado'
    `);

  return result.recordset[0];
};

const CR_BOUNDS = {
  minLat: 8.0,
  maxLat: 11.5,
  minLng: -86.2,
  maxLng: -82.2,
};

function enRangoCostaRica(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= CR_BOUNDS.minLat &&
    lat <= CR_BOUNDS.maxLat &&
    lng >= CR_BOUNDS.minLng &&
    lng <= CR_BOUNDS.maxLng
  );
}

/**
 * Intenta usar coordenadas reales del registro:
 * - Si ya están en rango CR: se usan.
 * - Si vienen invertidas (lat<->lng): las corrige.
 * - Si no son válidas para mapa público: null.
 */
function normalizarLatLngParaMapa(latRaw, lngRaw) {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (enRangoCostaRica(lat, lng)) {
    return { latitud: lat, longitud: lng, aproximada: false };
  }
  // Algunos registros históricos pueden venir invertidos en edición manual.
  if (enRangoCostaRica(lng, lat)) {
    return { latitud: lng, longitud: lat, aproximada: false };
  }
  return null;
}

/**
 * Coordenadas aproximadas para mapa público cuando no hay GPS usable.
 * Se derivan solo de id + canton_id para ubicar un pin dentro de Costa Rica sin exponer precisión.
 */
function latLngMapaPublico(fosilId, cantonId) {
  const a = Number(fosilId) || 0;
  const b = Number(cantonId) || 0;
  const seed = (a * 2654435761 + b * 2246822519 + 374761393) >>> 0;
  const u1 = (seed & 0xffff) / 0xffff;
  const u2 = ((seed >>> 16) & 0xffff) / 0xffff;
  const lat = 8.15 + u1 * (11.35 - 8.15);
  const lng = -85.95 + u2 * (-82.45 - -85.95);
  return {
    latitud: Math.round(lat * 100) / 100,
    longitud: Math.round(lng * 100) / 100,
  };
}

const obtenerPuntosMapaPublico = async () => {
  const result = await pool.request().query(`
    SELECT
      f.id,
      f.slug,
      f.nombre,
      f.canton_id,
      f.latitud,
      f.longitud,
      cf.codigo AS categoria_codigo,
      cant.nombre AS canton_nombre,
      prov.nombre AS provincia_nombre,
      pa.nombre AS pais_nombre,
      COALESCE(
        (
          SELECT TOP 1 m.url
          FROM MULTIMEDIA m
          WHERE m.fosil_id = f.id
            AND m.deleted_at IS NULL
            AND m.tipo = 'imagen'
          ORDER BY m.es_principal DESC, m.orden ASC, m.id ASC
        ),
        NULL
      ) AS portada_url
    FROM FOSIL f
    LEFT JOIN CATEGORIA_FOSIL cf ON cf.id = f.categoria_id
    LEFT JOIN CANTON cant ON cant.id = f.canton_id
    LEFT JOIN PROVINCIA prov ON prov.id = cant.provincia_id
    LEFT JOIN PAIS pa ON pa.id = prov.pais_id
    WHERE f.deleted_at IS NULL
      AND f.estado = 'publicado'
    ORDER BY f.created_at DESC, f.id DESC
  `);
  const rows = result.recordset || [];
  return rows.map((row) => {
    const normalizada = normalizarLatLngParaMapa(row.latitud, row.longitud);
    const coords = normalizada || latLngMapaPublico(row.id, row.canton_id);
    const { canton_id: _omit, ...rest } = row;
    return {
      ...rest,
      latitud: Math.round(coords.latitud * 100000) / 100000,
      longitud: Math.round(coords.longitud * 100000) / 100000,
      ubicacion_mapa_aproximada: normalizada ? false : true,
    };
  });
};

const obtenerDetalleCompleto = async (id) => {
  const result = await pool.request().input("id", id).query(`
      SELECT
        f.*,
        t.reino,
        t.filo,
        t.clase,
        t.orden,
        t.familia,
        t.genero,
        t.especie,
        CASE
          WHEN ua.id IS NOT NULL THEN NULLIF(LTRIM(RTRIM(CONCAT(ua.nombre, N' ', ua.apellido))), N'')
          ELSE NULL
        END AS investigador_responsable
      FROM FOSIL f
      LEFT JOIN TAXONOMIA t ON t.id = f.taxonomia_id
      LEFT JOIN USUARIO ua ON ua.id = f.administrador_id AND ua.deleted_at IS NULL
      WHERE f.id = @id
        AND f.deleted_at IS NULL
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
  "nombre_comun",
  "nombre_cientifico",
  "endurecedor",
  "completitud",
  "fractura",
  "meteorizacion",
  "abrasion",
  "largo_cm",
  "ancho_cm",
  "grosor_cm",
  "zona_utm",
  "cantera_sitio",
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
      key === "altitud_msnm" ||
      key === "largo_cm" ||
      key === "ancho_cm" ||
      key === "grosor_cm"
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

  const lastRs =
    result.recordsets && result.recordsets.length > 0
      ? result.recordsets[result.recordsets.length - 1]
      : result.recordset;
  const row = lastRs?.[0] || {};
  const nuevoId = row.id;
  if (nuevoId) {
    const taxonomiaId = await obtenerOCrearTaxonomiaId(data);
    await pool
      .request()
      .input("id", nuevoId)
      .input("descripcion_general", data.descripcion_general || null)
      .input("nombre_comun", data.nombre_comun || null)
      .input("nombre_cientifico", data.nombre_cientifico || null)
      .input("contexto_geologico", data.contexto_geologico || null)
      .input("descripcion_detallada", data.descripcion_detallada || null)
      .input("taxonomia_id", taxonomiaId)
      .query(`
        UPDATE FOSIL
        SET
          descripcion_general = COALESCE(@descripcion_general, descripcion_general),
          nombre_comun = @nombre_comun,
          nombre_cientifico = @nombre_cientifico,
          contexto_geologico = @contexto_geologico,
          descripcion_detallada = @descripcion_detallada,
          taxonomia_id = COALESCE(@taxonomia_id, taxonomia_id),
          updated_at = GETDATE()
        WHERE id = @id
      `);
  }
  return { id: nuevoId, codigo_unico: row.codigo_unico };
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

/** Cambio de estado vía SP (auditoría en BD). No usar para publicado/rechazado desde HTTP: ir por admin.service. */
const cambiarEstadoFosil = async (id, estado, adminId) => {
  await pool
    .request()
    .input("fosil_id", id)
    .input("nuevo_estado", estado)
    .input("admin_id", adminId)
    .input("notas", null)
    .execute("sp_cambiar_estado_fosil");

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
  obtenerPuntosMapaPublico,
  obtenerDetalleCompleto,
  obtenerFosilesPorExplorador,
  obtenerTodosFosilesGestion,
  obtenerFosilesParaInvestigador,
  crearFosil,
  actualizarFosil,
  eliminarFosil,
  cambiarEstadoFosil,
};
