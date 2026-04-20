const { pool, sql } = require("../../config/db");

async function obtenerUsuarioContacto(usuarioId) {
  const r = await pool
    .request()
    .input("id", usuarioId)
    .query(`
      SELECT nombre, apellido, email
      FROM USUARIO
      WHERE id = @id AND deleted_at IS NULL
    `);
  return r.recordset[0];
}

/** Validación: fósiles públicos y no eliminados. */
async function validarFosilesPublicos(ids) {
  if (!ids.length) return [];
  const req = pool.request();
  ids.forEach((id, i) => req.input(`f${i}`, id));
  const placeholders = ids.map((_, i) => `@f${i}`).join(", ");
  const result = await req.query(`
    SELECT id FROM FOSIL
    WHERE id IN (${placeholders})
      AND deleted_at IS NULL
      AND estado = 'publicado'
  `);
  const ok = new Set(result.recordset.map((row) => row.id));
  const faltan = ids.filter((id) => !ok.has(id));
  return faltan;
}

async function crearSolicitud(investigadorId, body) {
  const asunto = String(body.asunto || "").trim();
  const mensaje = String(body.mensaje || "").trim();
  const rawIds = Array.isArray(body.fosil_ids) ? body.fosil_ids : [];
  const fosil_ids = [...new Set(rawIds.map((x) => parseInt(x, 10)).filter(Boolean))];

  if (!asunto || !mensaje) {
    const e = new Error("Asunto y mensaje son obligatorios");
    e.statusCode = 400;
    throw e;
  }
  if (fosil_ids.length === 0) {
    const e = new Error("Seleccioná al menos un fósil del catálogo público");
    e.statusCode = 400;
    throw e;
  }

  const invalidos = await validarFosilesPublicos(fosil_ids);
  if (invalidos.length) {
    const e = new Error(
      `Estos IDs no están disponibles para solicitud (solo catálogo publicado): ${invalidos.join(", ")}`,
    );
    e.statusCode = 400;
    throw e;
  }

  const u = await obtenerUsuarioContacto(investigadorId);
  if (!u) {
    const e = new Error("Usuario no encontrado");
    e.statusCode = 404;
    throw e;
  }

  const insertSol = await pool
    .request()
    .input("investigador_id", investigadorId)
    .input("asunto", asunto)
    .input("mensaje", mensaje)
    .query(`
      INSERT INTO SOLICITUD_INVESTIGACION (investigador_id, asunto, mensaje)
      OUTPUT INSERTED.id
      VALUES (@investigador_id, @asunto, @mensaje)
    `);

  const solicitudId = insertSol.recordset[0].id;

  for (const fid of fosil_ids) {
    await pool
      .request()
      .input("solicitud_id", solicitudId)
      .input("fosil_id", fid)
      .query(`
        INSERT INTO SOLICITUD_INV_FOSIL (solicitud_id, fosil_id)
        VALUES (@solicitud_id, @fosil_id)
      `);
  }

  const reqN = pool.request();
  fosil_ids.forEach((id, i) => reqN.input(`f${i}`, id));
  const lines = await reqN.query(`
    SELECT id, nombre FROM FOSIL WHERE id IN (${fosil_ids.map((_, i) => `@f${i}`).join(", ")})
  `);

  const listaFosiles = lines.recordset
    .map((row) => `  · ID ${row.id}: ${row.nombre}`)
    .join("\n");

  const contactoAsunto = `[Solicitud investigación #${solicitudId}] ${asunto}`;
  const contactoMensaje =
    `Solicitud de acceso a datos científicos.\n\n` +
    `Investigador: ${u.nombre} ${u.apellido} <${u.email}>\n\n` +
    `Fósiles solicitados:\n${listaFosiles}\n\n` +
    `Objetivo / notas:\n${mensaje}\n\n` +
    `— El administrador puede aprobar o rechazar esta solicitud desde el panel.`;

  await pool
    .request()
    .input("nombre", `${u.nombre} ${u.apellido}`.trim())
    .input("email", u.email)
    .input("asunto", contactoAsunto)
    .input("mensaje", contactoMensaje)
    .query(`
      INSERT INTO CONTACTO (nombre, email, asunto, mensaje)
      VALUES (@nombre, @email, @asunto, @mensaje)
    `);

  return { id: solicitudId, mensaje: "Solicitud registrada. El equipo revisará tu pedido." };
}

async function listarMisSolicitudes(investigadorId) {
  const result = await pool
    .request()
    .input("investigador_id", investigadorId)
    .query(`
      SELECT
        s.id, s.asunto, s.estado, s.created_at, s.revisado_at, s.nota_admin,
        f.id AS fosil_id, f.nombre AS fosil_nombre
      FROM SOLICITUD_INVESTIGACION s
      LEFT JOIN SOLICITUD_INV_FOSIL sf ON sf.solicitud_id = s.id
      LEFT JOIN FOSIL f ON f.id = sf.fosil_id
      WHERE s.investigador_id = @investigador_id
      ORDER BY s.created_at DESC, f.id ASC
    `);

  const byId = new Map();
  for (const row of result.recordset) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        asunto: row.asunto,
        estado: row.estado,
        created_at: row.created_at,
        revisado_at: row.revisado_at,
        nota_admin: row.nota_admin,
        fosiles: [],
      });
    }
    if (row.fosil_id) {
      byId.get(row.id).fosiles.push({ id: row.fosil_id, nombre: row.fosil_nombre });
    }
  }
  return [...byId.values()];
}

async function listarSolicitudesPendientesAdmin() {
  const result = await pool.request().query(`
    SELECT
      s.id, s.asunto, s.mensaje, s.estado, s.created_at,
      u.nombre AS inv_nombre, u.apellido AS inv_apellido, u.email AS inv_email,
      f.id AS fosil_id, f.nombre AS fosil_nombre
    FROM SOLICITUD_INVESTIGACION s
    INNER JOIN USUARIO u ON u.id = s.investigador_id
    LEFT JOIN SOLICITUD_INV_FOSIL sf ON sf.solicitud_id = s.id
    LEFT JOIN FOSIL f ON f.id = sf.fosil_id
    WHERE s.estado = 'pendiente'
    ORDER BY s.created_at ASC, f.id ASC
  `);

  const byId = new Map();
  for (const row of result.recordset) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        asunto: row.asunto,
        mensaje: row.mensaje,
        estado: row.estado,
        created_at: row.created_at,
        inv_nombre: row.inv_nombre,
        inv_apellido: row.inv_apellido,
        inv_email: row.inv_email,
        fosiles: [],
      });
    }
    if (row.fosil_id) {
      byId.get(row.id).fosiles.push({ id: row.fosil_id, nombre: row.fosil_nombre });
    }
  }
  return [...byId.values()];
}

async function aprobarSolicitud(solicitudId, adminId) {
  const t = new sql.Transaction(pool);
  await t.begin();
  try {
    const rq = new sql.Request(t);
    rq.input("id", solicitudId);
    const cur = await rq.query(`
      SELECT id, estado, investigador_id
      FROM SOLICITUD_INVESTIGACION
      WHERE id = @id
    `);
    const sol = cur.recordset[0];
    if (!sol) {
      const e = new Error("Solicitud no encontrada");
      e.statusCode = 404;
      throw e;
    }
    if (sol.estado !== "pendiente") {
      const e = new Error("La solicitud ya fue revisada");
      e.statusCode = 400;
      throw e;
    }

    await new sql.Request(t)
      .input("id", solicitudId)
      .input("admin", adminId)
      .query(`
        UPDATE SOLICITUD_INVESTIGACION
        SET estado = 'aprobado',
            revisado_por = @admin,
            revisado_at = GETDATE()
        WHERE id = @id
      `);

    await new sql.Request(t)
      .input("sid", solicitudId)
      .input("inv", sol.investigador_id)
      .query(`
        MERGE INVESTIGADOR_FOSIL_AUTORIZADO AS t
        USING (
          SELECT @inv AS investigador_id, sf.fosil_id AS fosil_id, @sid AS solicitud_id
          FROM SOLICITUD_INV_FOSIL sf
          WHERE sf.solicitud_id = @sid
        ) AS s
        ON t.investigador_id = s.investigador_id AND t.fosil_id = s.fosil_id
        WHEN MATCHED THEN
          UPDATE SET solicitud_id = s.solicitud_id, created_at = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (investigador_id, fosil_id, solicitud_id)
          VALUES (s.investigador_id, s.fosil_id, s.solicitud_id);
      `);

    await t.commit();
    return { mensaje: "Solicitud aprobada. El investigador ya puede ver el detalle científico de esos fósiles." };
  } catch (e) {
    await t.rollback();
    throw e;
  }
}

async function rechazarSolicitud(solicitudId, adminId, nota) {
  const notaAdmin = nota != null ? String(nota).trim() : "";
  const result = await pool
    .request()
    .input("id", solicitudId)
    .input("admin", adminId)
    .input("nota", notaAdmin || null)
    .query(`
      UPDATE SOLICITUD_INVESTIGACION
      SET estado = 'rechazado',
          revisado_por = @admin,
          revisado_at = GETDATE(),
          nota_admin = @nota
      OUTPUT INSERTED.id, INSERTED.estado
      WHERE id = @id AND estado = 'pendiente'
    `);

  if (!result.recordset.length) {
    const e = new Error("Solicitud no encontrada o ya revisada");
    e.statusCode = 400;
    throw e;
  }
  return { mensaje: "Solicitud rechazada." };
}

async function investigadorTieneAccesoAFosil(investigadorId, fosilId) {
  const r = await pool
    .request()
    .input("inv", investigadorId)
    .input("fid", fosilId)
    .query(`
      SELECT 1 AS ok
      FROM INVESTIGADOR_FOSIL_AUTORIZADO
      WHERE investigador_id = @inv AND fosil_id = @fid
    `);
  return !!r.recordset[0];
}

module.exports = {
  crearSolicitud,
  listarMisSolicitudes,
  listarSolicitudesPendientesAdmin,
  aprobarSolicitud,
  rechazarSolicitud,
  investigadorTieneAccesoAFosil,
};
