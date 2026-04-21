const { pool } = require("../../config/db");
const nodemailer = require("nodemailer");
const suscriptoresService = require("../suscriptores/suscriptores.service");

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    secure: String(process.env.MAIL_SECURE || "false") === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  return transporter;
}

async function notificarExploradorEstado({ fosilId, nombreFosil, estado }) {
  const rs = await pool.request().input("id", fosilId).query(`
    SELECT TOP 1
      u.email,
      u.nombre,
      u.apellido
    FROM FOSIL f
    INNER JOIN USUARIO u ON u.id = f.explorador_id
    WHERE f.id = @id
      AND f.deleted_at IS NULL
      AND u.deleted_at IS NULL
  `);
  const row = rs.recordset?.[0];
  const to = row?.email ? String(row.email).trim() : "";
  if (!to) return { sent: false, reason: "no_email" };
  const tx = getTransporter();
  if (!tx) return { sent: false, reason: "smtp_not_configured" };

  const nombreExplorador = [row?.nombre, row?.apellido]
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .join(" ")
    .trim();
  const saludo = nombreExplorador ? `Hola ${nombreExplorador},` : "Hola,";
  const aprobado = estado === "publicado";
  const subject = aprobado
    ? `Tu hallazgo fue aprobado: ${nombreFosil}`
    : `Tu hallazgo fue rechazado: ${nombreFosil}`;
  const text = aprobado
    ? `${saludo}\n\nTu hallazgo "${nombreFosil}" fue aprobado y ya está publicado en el catálogo del museo.\n\nGracias por tu aporte.`
    : `${saludo}\n\nTu hallazgo "${nombreFosil}" fue rechazado por revisión administrativa.\nPodés actualizar la información y volver a enviarlo desde tu panel.\n\nGracias por tu aporte.`;

  try {
    await tx.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error("[admin] notificarExploradorEstado:", err?.message || err);
    return { sent: false, reason: "smtp_send_failed" };
  }
}

const aprobarFosil = async (id, adminId) => {
  const before = await pool.request().input("id", id).query(`
    SELECT TOP 1 id, nombre
    FROM FOSIL
    WHERE id = @id
  `);
  await pool
    .request()
    .input("fosil_id", id)
    .input("nuevo_estado", "publicado")
    .input("admin_id", adminId)
    .input("notas", null)
    .execute("sp_cambiar_estado_fosil");
  const nombre = before.recordset?.[0]?.nombre || `Fósil #${id}`;
  await suscriptoresService.notificarActivos({
    tipo: "fosil_publicado",
    titulo: `Nuevo fósil publicado: ${nombre}`,
    cuerpo: `Se publicó un nuevo fósil en la colección: ${nombre}.`,
  });
  await notificarExploradorEstado({
    fosilId: id,
    nombreFosil: nombre,
    estado: "publicado",
  });

  return { mensaje: "Fósil aprobado" };
};

const rechazarFosil = async (id, adminId) => {
  const before = await pool.request().input("id", id).query(`
    SELECT TOP 1 id, nombre
    FROM FOSIL
    WHERE id = @id
  `);
  await pool
    .request()
    .input("fosil_id", id)
    .input("nuevo_estado", "rechazado")
    .input("admin_id", adminId)
    .input("notas", null)
    .execute("sp_cambiar_estado_fosil");
  const nombre = before.recordset?.[0]?.nombre || `Fósil #${id}`;
  await notificarExploradorEstado({
    fosilId: id,
    nombreFosil: nombre,
    estado: "rechazado",
  });

  return { mensaje: "Fósil rechazado" };
};

const obtenerPendientes = async () => {
  const result = await pool.request().query(`
    SELECT id, nombre, estado, created_at
    FROM FOSIL
    WHERE estado = 'pendiente' AND deleted_at IS NULL
  `);

  return result.recordset;
};

const obtenerPapelera = async () => {
  const [usuariosResult, fosilesResult, contactoResult] = await Promise.all([
    pool.request().query(`
      SELECT id, nombre, apellido, email, deleted_at
      FROM USUARIO
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC, id DESC
    `),
    pool.request().query(`
      SELECT id, nombre, estado, deleted_at
      FROM FOSIL
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC, id DESC
    `),
    pool.request().query(`
      IF COL_LENGTH('CONTACTO', 'deleted_at') IS NOT NULL
      BEGIN
        SELECT id, nombre, email, asunto, deleted_at
        FROM CONTACTO
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC, id DESC
      END
      ELSE
      BEGIN
        SELECT TOP 0
          CAST(NULL AS INT) AS id,
          CAST(NULL AS VARCHAR(200)) AS nombre,
          CAST(NULL AS VARCHAR(255)) AS email,
          CAST(NULL AS VARCHAR(300)) AS asunto,
          CAST(NULL AS DATETIME2) AS deleted_at
      END
    `),
  ]);

  return {
    usuarios: usuariosResult.recordset || [],
    fosiles: fosilesResult.recordset || [],
    contacto: contactoResult.recordset || [],
  };
};

const restaurarUsuarioPapelera = async (id) => {
  await pool.request().input("id", id).query(`
    UPDATE USUARIO
    SET deleted_at = NULL, activo = 1, updated_at = GETDATE()
    WHERE id = @id AND deleted_at IS NOT NULL
  `);
  await pool.request().input("id", id).query(`
    UPDATE USUARIO_ROL
    SET activo = 1
    WHERE usuario_id = @id
  `);
  return { id };
};

const restaurarFosilPapelera = async (id) => {
  await pool.request().input("id", id).query(`
    UPDATE FOSIL
    SET deleted_at = NULL, updated_at = GETDATE()
    WHERE id = @id AND deleted_at IS NOT NULL
  `);
  return { id };
};

const restaurarContactoPapelera = async (id) => {
  const result = await pool.request().input("id", id).query(`
    IF COL_LENGTH('CONTACTO', 'deleted_at') IS NULL
    BEGIN
      SELECT CAST(0 AS INT) AS ok;
    END
    ELSE
    BEGIN
      UPDATE CONTACTO
      SET deleted_at = NULL
      WHERE id = @id AND deleted_at IS NOT NULL;
      SELECT CAST(1 AS INT) AS ok;
    END
  `);
  const ok = Number(result.recordset?.[0]?.ok || 0) === 1;
  if (!ok) {
    const e = new Error("Tu base actual no tiene papelera para CONTACTO. Ejecuta el script de migración nueva.");
    e.statusCode = 400;
    throw e;
  }
  return { id };
};

module.exports = {
  aprobarFosil,
  rechazarFosil,
  obtenerPendientes,
  obtenerPapelera,
  restaurarUsuarioPapelera,
  restaurarFosilPapelera,
  restaurarContactoPapelera,
};
