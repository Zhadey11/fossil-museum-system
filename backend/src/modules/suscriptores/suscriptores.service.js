const { pool } = require("../../config/db");
const nodemailer = require("nodemailer");

let transporter = null;
let tableNames = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    secure: String(process.env.MAIL_SECURE || "false") === "true",
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
  return transporter;
}

async function getTableNames() {
  if (tableNames) return tableNames;
  await pool.request().query(`
    IF OBJECT_ID('dbo.SUSCRIPTORES', 'U') IS NULL AND OBJECT_ID('dbo.SUSCRIPTOR', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.SUSCRIPTORES (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        correo NVARCHAR(255) NOT NULL UNIQUE,
        fecha_suscripcion DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        activo BIT NOT NULL DEFAULT 1
      );
    END;
    IF OBJECT_ID('dbo.SUSCRIPTORES_NOTIFICACIONES', 'U') IS NULL AND OBJECT_ID('dbo.SUSCRIPTOR_NOTIFICACION', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.SUSCRIPTORES_NOTIFICACIONES (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        tipo NVARCHAR(80) NOT NULL,
        titulo NVARCHAR(255) NOT NULL,
        enviados INT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END;
  `);
  const rs = await pool.request().query(`
    SELECT
      CASE WHEN OBJECT_ID('dbo.SUSCRIPTORES', 'U') IS NOT NULL THEN 'SUSCRIPTORES' ELSE 'SUSCRIPTOR' END AS subs,
      CASE WHEN OBJECT_ID('dbo.SUSCRIPTORES_NOTIFICACIONES', 'U') IS NOT NULL THEN 'SUSCRIPTORES_NOTIFICACIONES' ELSE 'SUSCRIPTOR_NOTIFICACION' END AS hist
  `);
  tableNames = rs.recordset?.[0] || { subs: "SUSCRIPTOR", hist: "SUSCRIPTOR_NOTIFICACION" };
  return tableNames;
}

const suscribir = async (correo) => {
  const t = await getTableNames();
  const c = String(correo || "").trim().toLowerCase();
  if (!c) throw new Error("Correo requerido");
  await pool
    .request()
    .input("correo", c)
    .query(`
      IF EXISTS(SELECT 1 FROM ${t.subs} WHERE correo = @correo)
      BEGIN
        UPDATE ${t.subs} SET activo = 1, fecha_suscripcion = GETDATE() WHERE correo = @correo;
      END
      ELSE
      BEGIN
        INSERT INTO ${t.subs} (correo, fecha_suscripcion, activo)
        VALUES (@correo, GETDATE(), 1);
      END
    `);
  return { mensaje: "¡Suscripción exitosa!" };
};

const listar = async () => {
  const t = await getTableNames();
  const r = await pool.request().query(`
    SELECT id, correo, fecha_suscripcion, activo
    FROM ${t.subs}
    ORDER BY fecha_suscripcion DESC, id DESC
  `);
  return r.recordset;
};

const cambiarActivo = async (id, activo) => {
  const t = await getTableNames();
  await pool
    .request()
    .input("id", id)
    .input("activo", activo ? 1 : 0)
    .query(`UPDATE ${t.subs} SET activo = @activo WHERE id = @id`);
  return { id, activo: !!activo };
};

const eliminar = async (id) => {
  const t = await getTableNames();
  await pool.request().input("id", id).query(`DELETE FROM ${t.subs} WHERE id = @id`);
  return { id };
};

const historial = async () => {
  const t = await getTableNames();
  const r = await pool.request().query(`
    SELECT id, tipo, titulo, enviados, created_at
    FROM ${t.hist}
    ORDER BY created_at DESC, id DESC
  `);
  return r.recordset;
};

const notificarActivos = async ({ tipo, titulo, cuerpo }) => {
  const t = await getTableNames();
  const rs = await pool.request().query(`
    SELECT id, correo
    FROM ${t.subs}
    WHERE activo = 1
    ORDER BY id ASC
  `);
  const activos = rs.recordset || [];
  if (activos.length === 0) {
    await pool
      .request()
      .input("tipo", tipo)
      .input("titulo", titulo)
      .input("enviados", 0)
      .query(`
        INSERT INTO ${t.hist} (tipo, titulo, enviados, created_at)
        VALUES (@tipo, @titulo, @enviados, GETDATE())
      `);
    return { enviados: 0 };
  }
  const tx = getTransporter();
  let sent = 0;
  if (tx) {
    for (const s of activos) {
      try {
        await tx.sendMail({
          from: process.env.MAIL_FROM || process.env.MAIL_USER,
          to: s.correo,
          subject: titulo,
          text: cuerpo,
        });
        sent += 1;
      } catch {
        /* ignore */
      }
    }
  }
  await pool
    .request()
    .input("tipo", tipo)
    .input("titulo", titulo)
    .input("enviados", sent)
    .query(`
      INSERT INTO ${t.hist} (tipo, titulo, enviados, created_at)
      VALUES (@tipo, @titulo, @enviados, GETDATE())
    `);
  return { enviados: sent };
};

module.exports = {
  suscribir,
  listar,
  cambiarActivo,
  eliminar,
  historial,
  notificarActivos,
};
