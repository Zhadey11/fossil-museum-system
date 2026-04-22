const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const { poolConnect } = require("./src/config/db");

const PORT = process.env.PORT || 4000;
/** En Windows suele bastar con listen(port); con 0.0.0.0 queda explícito para probar desde el móvil en la misma red. */
const BIND_HOST = process.env.BIND_HOST || "0.0.0.0";

const useWin =
  process.env.DB_USE_WINDOWS_AUTH === "true";
const required = useWin
  ? ["DB_SERVER", "DB_DATABASE", "JWT_SECRET"]
  : ["DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD", "JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    "Faltan variables de entorno:",
    missing.join(", "),
    "- Copia backend/.env.example a backend/.env y completa los valores.",
  );
  process.exit(1);
}

poolConnect
  .then(() => {
    console.log("Conectado a SQL Server (FosilesDB)");
    app.listen(PORT, BIND_HOST, () => {
      console.log(`Servidor local: http://localhost:${PORT}`);
      if (BIND_HOST === "0.0.0.0") {
        console.log(
          `Red local: desde otro dispositivo usá http://<IP-de-esta-PC>:${PORT} (configurá también NEXT_PUBLIC_API_URL en el frontend).`,
        );
      }
      if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.log(
          "Aviso: MAIL_HOST / MAIL_USER / MAIL_PASS no están definidos — los correos de contacto y credenciales no se enviarán (copiá la sección Correo de .env.example).",
        );
      }
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
    process.exit(1);
  });
