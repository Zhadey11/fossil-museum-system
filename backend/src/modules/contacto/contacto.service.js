const { pool } = require("../../config/db");
const nodemailer = require("nodemailer");

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

const enviarMensaje = async (data) => {
  const nombre = String(data.nombre || "").trim();
  const email = String(data.email || "").trim();
  const asunto = String(data.asunto || "").trim();
  const mensaje = String(data.mensaje || "").trim();

  if (!nombre || !email || !asunto || !mensaje) {
    throw new Error("Faltan campos obligatorios");
  }

  await pool
    .request()
    .input("nombre", nombre)
    .input("email", email)
    .input("asunto", asunto)
    .input("mensaje", mensaje)
    .query(`
      INSERT INTO CONTACTO (nombre, email, asunto, mensaje)
      VALUES (@nombre, @email, @asunto, @mensaje)
    `);

  const to = process.env.CONTACTO_INSTITUCIONAL_EMAIL;
  const tx = getTransporter();
  let correoEnviado = false;
  if (to && tx) {
    try {
      await tx.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject: `[Contacto Museo] ${asunto}`,
        text: `Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`,
      });
      correoEnviado = true;
    } catch (mailErr) {
      console.error("CONTACTO SMTP ERROR:", mailErr?.message || mailErr);
    }
  }

  return {
    mensaje: "Mensaje enviado",
    correo_institucional: to || null,
    correo_enviado: correoEnviado,
  };
};

const obtenerMensajes = async () => {
  const result = await pool.request().query(`
    SELECT id, nombre, email, asunto, mensaje, leido, respondido, created_at
    FROM CONTACTO
    ORDER BY created_at DESC, id DESC
  `);
  return result.recordset;
};

module.exports = { enviarMensaje, obtenerMensajes };
