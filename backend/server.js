const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const { poolConnect } = require("./src/config/db");

const PORT = process.env.PORT || 4000;

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
    app.listen(PORT, () => {
      console.log(`Servidor: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
    process.exit(1);
  });
