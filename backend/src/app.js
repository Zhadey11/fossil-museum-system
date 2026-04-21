const path = require("path");
const { IMAGES_DIR, VIDEOS_DIR, UPLOADS_DIR } = require("./config/paths");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const audit = require("./middlewares/audit");

const fosilesRoutes = require("./modules/fosiles/fosiles.routes");
const authRoutes = require("./modules/auth/auth.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const multimediaRoutes = require("./modules/multimedia/multimedia.routes");
const taxonomiaRoutes = require("./modules/taxonomia/taxonomia.routes");
const geologiaRoutes = require("./modules/geologia/geologia.routes");
const ubicacionRoutes = require("./modules/ubicacion/ubicacion.routes");
const estudiosRoutes = require("./modules/estudios/estudios.routes");
const contactoRoutes = require("./modules/contacto/contacto.routes");
const catalogosRoutes = require("./modules/catalogos/catalogos.routes");
const investigacionRoutes = require("./modules/investigacion/investigacion.routes");
const suscriptoresRoutes = require("./modules/suscriptores/suscriptores.routes");

const app = express();
const openapiPath = path.join(__dirname, "..", "docs", "openapi.yaml");
let openapiDoc = null;
try {
  openapiDoc = YAML.load(openapiPath);
} catch {
  openapiDoc = null;
}

/** Incluye el par localhost ↔ 127.0.0.1 con el mismo host:puerto (evita bloqueos CORS en dev). */
function expandDevOrigins(origins) {
  const out = new Set(origins);
  for (const o of origins) {
    try {
      const u = new URL(o);
      const tail = `${u.port ? `:${u.port}` : ""}${u.pathname}${u.search}`;
      if (u.hostname === "localhost") {
        out.add(`${u.protocol}//127.0.0.1${tail}`);
      } else if (u.hostname === "127.0.0.1") {
        out.add(`${u.protocol}//localhost${tail}`);
      }
    } catch {
      /* ignorar entradas inválidas */
    }
  }
  return [...out];
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * En desarrollo, Next suele mostrar también http://IP-LAN:3000; si FRONTEND_URL solo
 * lista localhost, el login falla por CORS. En producción se usa la lista de .env.
 */
const configuredOrigins = process.env.FRONTEND_URL
  ? expandDevOrigins(process.env.FRONTEND_URL.split(",").map((s) => s.trim()))
  : [];
const corsOriginOption =
  configuredOrigins.length > 0 ? configuredOrigins : !isProduction;

app.use(
  cors({
    origin: corsOriginOption,
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 80,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(audit);

const mediaStaticOptions = {
  etag: true,
  lastModified: true,
  maxAge: "1d",
  setHeaders: (res, filePath) => {
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    if (typeof filePath === "string" && filePath.toLowerCase().endsWith(".avif")) {
      res.setHeader("Content-Type", "image/avif");
    }
  },
};

app.use("/uploads", express.static(UPLOADS_DIR, mediaStaticOptions));
app.use("/images", express.static(IMAGES_DIR, mediaStaticOptions));
app.use("/videos", express.static(VIDEOS_DIR, mediaStaticOptions));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/fosiles", fosilesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/multimedia", multimediaRoutes);
app.use("/api/taxonomia", taxonomiaRoutes);
app.use("/api/geologia", geologiaRoutes);
app.use("/api/ubicacion", ubicacionRoutes);
app.use("/api/estudios", estudiosRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/catalogos", catalogosRoutes);
app.use("/api/investigacion", investigacionRoutes);
app.use("/api/suscriptores", suscriptoresRoutes);
if (openapiDoc) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
}

module.exports = app;
