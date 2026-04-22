const crypto = require("crypto");
const { pool } = require("../../config/db");
const nodemailer = require("nodemailer");
const usuariosService = require("../usuarios/usuarios.service");

let transporter = null;
let contactoColumnsEnsured = false;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.MAIL_HOST;
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  const port = parseInt(process.env.MAIL_PORT || "587", 10);
  const secureFlag = String(process.env.MAIL_SECURE || "").toLowerCase();
  /** 465 = SSL directo; 587/25 suelen usar STARTTLS (secure: false). */
  const secure = secureFlag === "true" || port === 465;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized:
        String(process.env.MAIL_TLS_REJECT_UNAUTHORIZED || "true").toLowerCase() !== "false",
    },
  });
  return transporter;
}

function smtpNotConfiguredMessage() {
  return "SMTP no configurado: en backend/.env definí MAIL_HOST, MAIL_USER y MAIL_PASS (ver .env.example y README).";
}

/**
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function sendSmtpMail({ to, subject, text }) {
  if (!to || !String(to).trim()) {
    return { ok: false, error: "Sin destinatario de correo." };
  }
  const tx = getTransporter();
  if (!tx) {
    return { ok: false, error: smtpNotConfiguredMessage() };
  }
  const from = process.env.MAIL_FROM || process.env.MAIL_USER;
  if (!from) {
    return { ok: false, error: "Definí MAIL_FROM o MAIL_USER como remitente en .env." };
  }
  try {
    await tx.sendMail({
      from,
      to: String(to).trim(),
      subject,
      text,
    });
    return { ok: true };
  } catch (err) {
    const msg = err?.message || String(err);
    const code = err?.responseCode || err?.code;
    const detail = err?.response || err?.command;
    console.error("[contacto] SMTP:", code || "", msg, detail || "");
    let hint = msg;
    if (/Invalid login|535|authentication failed|EAUTH/i.test(msg)) {
      hint += " — Revisá usuario/contraseña; en Gmail usá «contraseña de aplicación», no la clave normal.";
    }
    if (/certificate|UNABLE_TO_VERIFY_LEAF_SIGNATURE|self signed/i.test(msg)) {
      hint +=
        " — Problema de certificado TLS; solo en entornos de prueba podés probar MAIL_TLS_REJECT_UNAUTHORIZED=false.";
    }
    return { ok: false, error: code ? `${hint} (código ${code})` : hint };
  }
}

async function ensureContactoSolicitudColumns() {
  if (contactoColumnsEnsured) return;
  await pool.request().query(`
    IF COL_LENGTH('dbo.CONTACTO', 'solicitud_tipo') IS NULL
      ALTER TABLE dbo.CONTACTO ADD solicitud_tipo VARCHAR(30) NULL;
    IF COL_LENGTH('dbo.CONTACTO', 'solicitud_estado') IS NULL
      ALTER TABLE dbo.CONTACTO ADD solicitud_estado VARCHAR(20) NULL;
  `);
  contactoColumnsEnsured = true;
}

/** Texto exacto del rol en correos ("investigador", "explorador", "colaborador"). */
function etiquetaRolSolicitud(tipo) {
  switch (String(tipo || "").toLowerCase()) {
    case "investigador":
      return "investigador";
    case "explorador":
      return "explorador";
    case "colaborador":
      return "colaborador";
    default:
      return "usuario";
  }
}

function isEmailFormatValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function rolIdDesdeTipo(tipo) {
  const t = String(tipo || "").toLowerCase();
  if (t === "explorador") return 3;
  if (t === "investigador" || t === "colaborador") return 2;
  return null;
}

/** Mensajes guardados antes de agregar solicitud_tipo. */
function inferTipoDesdeAsunto(asunto) {
  const a = String(asunto || "");
  if (/Quiero ser investigador/i.test(a)) return "investigador";
  if (/Quiero ser explorador/i.test(a)) return "explorador";
  if (/Propuesta de colaboración/i.test(a)) return "colaborador";
  return null;
}

function tipoEfectivoSolicitud(row) {
  let t = String(row.solicitud_tipo || "").toLowerCase();
  if (!t || t === "general") {
    const inf = inferTipoDesdeAsunto(row.asunto);
    if (inf) t = inf;
  }
  return t;
}

function generarPasswordTemporal() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(14);
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[bytes[i] % chars.length];
  return s;
}

function accesoUrlPublico() {
  const base = String(process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/acceso`;
}

async function enviarCorreo(destinatario, subject, text) {
  return sendSmtpMail({ to: destinatario, subject, text });
}

const enviarMensaje = async (data) => {
  await ensureContactoSolicitudColumns();
  const nombre = String(data.nombre || "").trim();
  const email = String(data.email || "").trim();
  const asunto = String(data.asunto || "").trim();
  const mensaje = String(data.mensaje || "").trim();
  const tipoRaw = String(data.tipo_solicitud || data.tipoSolicitud || "general")
    .trim()
    .toLowerCase();
  const tiposValidos = new Set(["general", "investigador", "explorador", "colaborador"]);
  const solicitudTipo = tiposValidos.has(tipoRaw) ? tipoRaw : "general";
  const solicitudEstado =
    solicitudTipo !== "general" ? "pendiente" : null;

  if (!nombre || !email || !asunto || !mensaje) {
    throw new Error("Faltan campos obligatorios");
  }
  if (!isEmailFormatValid(email)) {
    const e = new Error("El correo electrónico no tiene un formato válido");
    e.statusCode = 400;
    throw e;
  }

  await pool
    .request()
    .input("nombre", nombre)
    .input("email", email)
    .input("asunto", asunto)
    .input("mensaje", mensaje)
    .input("solicitud_tipo", solicitudTipo)
    .input("solicitud_estado", solicitudEstado)
    .query(`
      INSERT INTO CONTACTO (nombre, email, asunto, mensaje, solicitud_tipo, solicitud_estado)
      VALUES (@nombre, @email, @asunto, @mensaje, @solicitud_tipo, @solicitud_estado)
    `);

  const to = process.env.CONTACTO_INSTITUCIONAL_EMAIL;
  let correoInstitucionalEnviado = false;
  let correoInstitucionalError = null;
  if (to) {
    const inst = await sendSmtpMail({
      to,
      subject: `[Contacto Museo] ${asunto}`,
      text: `Nombre: ${nombre}\nEmail: ${email}\nTipo solicitud: ${solicitudTipo}\n\n${mensaje}`,
    });
    correoInstitucionalEnviado = inst.ok;
    correoInstitucionalError = inst.ok ? null : inst.error;
  }

  let correoSolicitanteEnviado = false;
  let correoAcuseError = null;
  if (solicitudTipo !== "general") {
    const rolTxt = etiquetaRolSolicitud(solicitudTipo);
    const urlAcceso = accesoUrlPublico();
    const cuerpo = `Hola ${nombre},

Recibimos tu solicitud para ser ${rolTxt} en el sistema del museo.

IMPORTANTE: te avisaremos por ESTE MISMO CORREO cuando el equipo decida.

• Si te ACEPTAN: vas a recibir un mensaje con el asunto indicando que fue APROBADA. Ahí verás claramente CUÁL ES EL CORREO con el que debés iniciar sesión y tu contraseña, y el enlace a la página de acceso (${urlAcceso}).

• Si NO te ACEPTAN: vas a recibir un mensaje indicando que la solicitud NO fue aprobada. En ese caso no hay cuenta ni contraseña para entrar.

Revisá también la carpeta de spam si no ves la respuesta.

Gracias por tu interés.
`;
    const acuse = await enviarCorreo(
      email,
      `[Museo] Solicitud recibida — te avisaremos si te aceptan o no (${rolTxt})`,
      cuerpo,
    );
    correoSolicitanteEnviado = acuse.ok;
    correoAcuseError = acuse.ok ? null : acuse.error;
  }

  return {
    mensaje: "Mensaje enviado",
    correo_institucional: to || null,
    correo_institucional_enviado: correoInstitucionalEnviado,
    correo_institucional_error: correoInstitucionalError,
    correo_acuse_solicitante: solicitudTipo !== "general" ? correoSolicitanteEnviado : null,
    correo_acuse_error: solicitudTipo !== "general" ? correoAcuseError : null,
  };
};

const obtenerMensajes = async () => {
  await ensureContactoSolicitudColumns();
  const result = await pool.request().query(`
    IF COL_LENGTH('CONTACTO', 'deleted_at') IS NOT NULL
    BEGIN
      SELECT id, nombre, email, asunto, mensaje, leido, respondido, created_at,
        solicitud_tipo, solicitud_estado
      FROM CONTACTO
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
    END
    ELSE
    BEGIN
      SELECT id, nombre, email, asunto, mensaje, leido, respondido, created_at,
        solicitud_tipo, solicitud_estado
      FROM CONTACTO
      ORDER BY created_at DESC, id DESC
    END
  `);
  return result.recordset;
};

const marcarLeido = async (id, leido) => {
  await pool
    .request()
    .input("id", id)
    .input("leido", leido ? 1 : 0)
    .query(`
      UPDATE CONTACTO
      SET leido = @leido
      WHERE id = @id
    `);
  return { id, leido: !!leido };
};

const eliminarMensaje = async (id) => {
  await pool
    .request()
    .input("id", id)
    .query(`
      IF COL_LENGTH('CONTACTO', 'deleted_at') IS NOT NULL
      BEGIN
        UPDATE CONTACTO
        SET deleted_at = GETDATE()
        WHERE id = @id
      END
      ELSE
      BEGIN
        DELETE FROM CONTACTO
        WHERE id = @id
      END
    `);
  return { id };
};

async function obtenerContactoPorId(id) {
  await ensureContactoSolicitudColumns();
  const r = await pool.request().input("id", id).query(`
    SELECT TOP 1 *
    FROM CONTACTO
    WHERE id = @id AND deleted_at IS NULL
  `);
  return r.recordset?.[0] || null;
}

const aprobarSolicitudContacto = async (contactoId, adminId, options = {}) => {
  await ensureContactoSolicitudColumns();
  const row = await obtenerContactoPorId(contactoId);
  if (!row) {
    const e = new Error("Mensaje no encontrado");
    e.statusCode = 404;
    throw e;
  }
  const tipo = tipoEfectivoSolicitud(row);
  if (!tipo || tipo === "general") {
    const e = new Error("Este mensaje no es una solicitud de acceso");
    e.statusCode = 400;
    throw e;
  }
  const estado = String(row.solicitud_estado || "").toLowerCase();
  if (estado === "aprobada") {
    const e = new Error("Esta solicitud ya fue aprobada");
    e.statusCode = 400;
    throw e;
  }
  if (estado === "rechazada") {
    const e = new Error("Esta solicitud ya fue rechazada");
    e.statusCode = 400;
    throw e;
  }

  const rolId = rolIdDesdeTipo(tipo);
  if (!rolId) {
    const e = new Error("Tipo de solicitud no válido para crear cuenta");
    e.statusCode = 400;
    throw e;
  }

  /** Siempre el correo que la persona puso en el formulario: ahí recibe acuse / aprobación / rechazo. */
  const emailDelFormulario = String(row.email || "").trim().toLowerCase();
  if (!isEmailFormatValid(emailDelFormulario)) {
    const e = new Error("El mensaje de contacto no tiene un correo válido para enviar notificaciones");
    e.statusCode = 400;
    throw e;
  }

  const emailFromAdmin =
    options.email != null && String(options.email).trim() !== ""
      ? String(options.email).trim().toLowerCase()
      : emailDelFormulario;
  const emailUsuario = emailFromAdmin;
  if (!isEmailFormatValid(emailUsuario)) {
    const e = new Error("El correo para la cuenta (acceso a la página) no tiene un formato válido");
    e.statusCode = 400;
    throw e;
  }

  const existe = await pool.request().input("email", emailUsuario).query(`
    SELECT TOP 1 id FROM USUARIO WHERE email = @email AND deleted_at IS NULL
  `);
  if (existe.recordset?.length) {
    const e = new Error("Ya existe un usuario activo con ese correo");
    e.statusCode = 400;
    throw e;
  }

  const nombreCompleto = String(row.nombre || "").trim();
  const partes = nombreCompleto.split(/\s+/).filter(Boolean);
  const nombre = partes[0] || "Usuario";
  const apellido = partes.slice(1).join(" ") || "-";

  const password =
    typeof options.password === "string" && options.password.length >= 8
      ? options.password
      : generarPasswordTemporal();

  await usuariosService.crearUsuario({
    nombre,
    apellido,
    email: emailUsuario,
    password,
    roles: [rolId],
  });

  await pool
    .request()
    .input("id", contactoId)
    .input("solicitud_tipo", tipo)
    .input("email_cuenta", emailUsuario)
    .query(`
      UPDATE CONTACTO
      SET solicitud_estado = 'aprobada',
          solicitud_tipo = COALESCE(solicitud_tipo, @solicitud_tipo),
          email = @email_cuenta,
          respondido = 1,
          leido = 1
      WHERE id = @id
    `);

  const urlAcceso = accesoUrlPublico();
  const rolTxt = etiquetaRolSolicitud(tipo);
  const mismoCorreo = emailDelFormulario === emailUsuario;
  const cuerpoBienvenida = `Hola ${nombreCompleto},

*** TU SOLICITUD FUE APROBADA ***
¡Bienvenido/a! Ya podés entrar al sistema del museo como ${rolTxt}.

Este mensaje te llegó al correo que dejaste en el formulario (${emailDelFormulario}). Ahí es donde siempre te avisamos.

Guardá estos datos; son los que pedirá la página de acceso al entrar:

────────────────────────────────────
CORREO PARA INICIAR SESIÓN EN LA PÁGINA:
  ${emailUsuario}
  (Escribilo exactamente así en la pantalla de acceso.)

CONTRASEÑA (asignada para esa cuenta):
  ${password}

PÁGINA PARA ENTRAR:
  ${urlAcceso}
────────────────────────────────────

${
  mismoCorreo
    ? ""
    : `Nota: el correo con el que entrás a la página (${emailUsuario}) no es el mismo que el del formulario; igual te enviamos este aviso solo al correo del formulario.\n\n`
}Te recomendamos cambiar la contraseña después del primer ingreso, cuando la opción esté disponible en tu perfil.

Saludos,
Equipo del museo
`;
  const mailRes = await enviarCorreo(
    emailDelFormulario,
    "[Museo] SOLICITUD APROBADA — tu correo y contraseña para entrar",
    cuerpoBienvenida,
  );

  return {
    mensaje: "Solicitud aprobada y usuario creado",
    correo_credenciales_enviado: mailRes.ok,
    correo_error: mailRes.ok ? undefined : mailRes.error,
  };
};

const rechazarSolicitudContacto = async (contactoId, _adminId, options = {}) => {
  await ensureContactoSolicitudColumns();
  const row = await obtenerContactoPorId(contactoId);
  if (!row) {
    const e = new Error("Mensaje no encontrado");
    e.statusCode = 404;
    throw e;
  }
  const tipo = tipoEfectivoSolicitud(row);
  if (!tipo || tipo === "general") {
    const e = new Error("Este mensaje no es una solicitud de acceso");
    e.statusCode = 400;
    throw e;
  }
  const estado = String(row.solicitud_estado || "").toLowerCase();
  if (estado === "aprobada") {
    const e = new Error("Esta solicitud ya fue aprobada");
    e.statusCode = 400;
    throw e;
  }
  if (estado === "rechazada") {
    const e = new Error("Esta solicitud ya fue rechazada");
    e.statusCode = 400;
    throw e;
  }

  await pool
    .request()
    .input("id", contactoId)
    .input("solicitud_tipo", tipo)
    .query(`
      UPDATE CONTACTO
      SET solicitud_estado = 'rechazada',
          solicitud_tipo = COALESCE(solicitud_tipo, @solicitud_tipo),
          respondido = 1,
          leido = 1
      WHERE id = @id
    `);

  const nombreCompleto = String(row.nombre || "").trim();
  const emailUsuario = String(row.email || "").trim();
  const notaAdmin = String(options.nota || "").trim();
  const rolTxt = etiquetaRolSolicitud(tipo);
  const cuerpo = `Hola ${nombreCompleto},

*** TU SOLICITUD NO FUE APROBADA ***

En esta ocasión el museo no puede darte acceso al sistema como ${rolTxt} (no cumplís los requisitos en esta instancia).

Qué significa esto para vos:
• NO se creó ninguna cuenta a tu nombre.
• NO tenés contraseña ni correo de acceso por este trámite.
• Este mensaje es solo el aviso de que no fue aceptada la solicitud.

${notaAdmin ? `Nota del equipo: ${notaAdmin}\n\n` : ""}Si tenés consultas, podés escribirnos de nuevo por el formulario de contacto.

Saludos,
Equipo del museo
`;
  const mailRes = await enviarCorreo(
    emailUsuario,
    "[Museo] Solicitud NO aprobada — sin acceso al sistema",
    cuerpo,
  );

  return {
    mensaje: "Solicitud rechazada",
    correo_rechazo_enviado: mailRes.ok,
    correo_error: mailRes.ok ? undefined : mailRes.error,
  };
};

module.exports = {
  enviarMensaje,
  obtenerMensajes,
  marcarLeido,
  eliminarMensaje,
  aprobarSolicitudContacto,
  rechazarSolicitudContacto,
};
