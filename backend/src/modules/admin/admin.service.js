const { pool } = require("../../config/db");
const fs = require("fs");
const path = require("path");
const { diskPathFromPublicUrl } = require("../../config/paths");
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

function carpetaObjetivoPorCategoria(categoriaCodigo) {
  const code = String(categoriaCodigo || "").toUpperCase().trim();
  if (code === "PAL") return "paleontologico-especifico";
  if (code === "MIN") return "minerales";
  if (code === "ROC") return "rocas";
  return "generales";
}

async function moverMultimediaDePendingAFinal(fosilId) {
  const info = await pool.request().input("id", fosilId).query(`
    SELECT TOP 1
      f.id,
      f.categoria_id,
      cf.codigo AS categoria_codigo
    FROM FOSIL f
    LEFT JOIN CATEGORIA_FOSIL cf ON cf.id = f.categoria_id
    WHERE f.id = @id
      AND f.deleted_at IS NULL
  `);
  const fosil = info.recordset?.[0];
  if (!fosil) return;

  const targetFolder = carpetaObjetivoPorCategoria(fosil.categoria_codigo);
  const mm = await pool.request().input("fosil_id", fosilId).query(`
    SELECT id, url
    FROM MULTIMEDIA
    WHERE fosil_id = @fosil_id
      AND deleted_at IS NULL
    ORDER BY id ASC
  `);
  const rows = mm.recordset || [];
  for (const row of rows) {
    const oldUrl = String(row.url || "");
    if (oldUrl.startsWith("/images/pending/")) {
      const fileName = path.basename(oldUrl);
      const newUrl = `/images/fossiles/${targetFolder}/${fileName}`;
      const oldAbs = diskPathFromPublicUrl(oldUrl);
      const newAbs = diskPathFromPublicUrl(newUrl);
      if (oldAbs && newAbs && fs.existsSync(oldAbs)) {
        fs.mkdirSync(path.dirname(newAbs), { recursive: true });
        fs.renameSync(oldAbs, newAbs);
      }
      await pool
        .request()
        .input("id", row.id)
        .input("new_url", newUrl)
        .query(`
          UPDATE MULTIMEDIA
          SET url = @new_url
          WHERE id = @id
            AND deleted_at IS NULL
        `);
      continue;
    }

    if (oldUrl.startsWith("/videos/pending/")) {
      const fileName = path.basename(oldUrl);
      const newUrl = `/videos/fossiles/${fileName}`;
      const oldAbs = diskPathFromPublicUrl(oldUrl);
      const newAbs = diskPathFromPublicUrl(newUrl);
      if (oldAbs && newAbs && fs.existsSync(oldAbs)) {
        fs.mkdirSync(path.dirname(newAbs), { recursive: true });
        fs.renameSync(oldAbs, newAbs);
      }
      await pool
        .request()
        .input("id", row.id)
        .input("new_url", newUrl)
        .query(`
          UPDATE MULTIMEDIA
          SET url = @new_url
          WHERE id = @id
            AND deleted_at IS NULL
        `);
    }
  }
}

const aprobarFosil = async (id, adminId) => {
  const before = await pool.request().input("id", id).query(`
    SELECT TOP 1
      id, nombre, latitud, longitud,
      descripcion_general, nombre_comun, nombre_cientifico, contexto_geologico, descripcion_detallada,
      cantera_sitio, zona_utm, abrasion, fractura, completitud
    FROM FOSIL
    WHERE id = @id
  `);
  const row = before.recordset?.[0];
  if (!row) {
    const err = new Error("Fósil no encontrado");
    err.statusCode = 404;
    throw err;
  }
  if (row.latitud == null || row.longitud == null) {
    const err = new Error("No se puede publicar sin coordenadas (latitud y longitud).");
    err.statusCode = 400;
    throw err;
  }
  const mmCount = await pool.request().input("id", id).query(`
    SELECT COUNT(1) AS total
    FROM MULTIMEDIA
    WHERE fosil_id = @id
      AND deleted_at IS NULL
      AND tipo = 'imagen'
  `);
  const totalImagenes = Number(mmCount.recordset?.[0]?.total || 0);
  if (totalImagenes < 1) {
    const err = new Error("No se puede publicar sin al menos una imagen del hallazgo.");
    err.statusCode = 400;
    throw err;
  }
  const incompleto =
    !String(row.descripcion_general || "").trim() ||
    !String(row.nombre_comun || "").trim() ||
    !String(row.nombre_cientifico || "").trim() ||
    !String(row.contexto_geologico || "").trim() ||
    !String(row.descripcion_detallada || "").trim();
  if (incompleto) {
    const err = new Error(
      "No se puede publicar: faltan resumen, nombre común/científico, contexto geológico o descripción detallada.",
    );
    err.statusCode = 400;
    throw err;
  }
  // Si faltan datos curatoriales, completamos "No aplica" para no bloquear el flujo.
  const cantera = String(row.cantera_sitio || "").trim() || "No aplica";
  const zonaUtm = String(row.zona_utm || "").trim() || "No aplica";
  const abrasion = String(row.abrasion || "").trim() || "No aplica";
  const fractura = String(row.fractura || "").trim() || "No aplica";
  const completitud = String(row.completitud || "").trim() || "No aplica";
  await pool
    .request()
    .input("id", id)
    .input("cantera_sitio", cantera)
    .input("zona_utm", zonaUtm)
    .input("abrasion", abrasion)
    .input("fractura", fractura)
    .input("completitud", completitud)
    .query(`
      UPDATE FOSIL
      SET
        cantera_sitio = @cantera_sitio,
        zona_utm = @zona_utm,
        abrasion = @abrasion,
        fractura = @fractura,
        completitud = @completitud,
        updated_at = GETDATE()
      WHERE id = @id
    `);
  // Flujo requerido: pending -> carpeta final por categoría al aprobar.
  await moverMultimediaDePendingAFinal(id);
  await pool
    .request()
    .input("fosil_id", id)
    .input("nuevo_estado", "publicado")
    .input("admin_id", adminId)
    .input("notas", null)
    .execute("sp_cambiar_estado_fosil");
  const nombre = row.nombre || `Fósil #${id}`;
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
