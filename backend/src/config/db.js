const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

function normalizeServer(server) {
  const s = (server || "").trim();
  if (s === "" || s === ".") {
    return "(local)";
  }
  return s;
}

const useWindowsAuth = process.env.DB_USE_WINDOWS_AUTH === "true";

const trustServerCertificate =
  process.env.DB_TRUST_SERVER_CERTIFICATE !== "false";

let sql;
let pool;

if (useWindowsAuth) {
  sql = require("mssql/msnodesqlv8");
  const driver =
    process.env.DB_ODBC_DRIVER || "ODBC Driver 18 for SQL Server";
  const server = normalizeServer(process.env.DB_SERVER);
  const database = process.env.DB_DATABASE;
  const portRaw = process.env.DB_PORT && String(process.env.DB_PORT).trim();

  let serverPart = server;
  if (portRaw) {
    serverPart = `${server},${parseInt(portRaw, 10)}`;
  }

  const connectionString =
    `Driver={${driver}};` +
    `Server=${serverPart};` +
    `Database=${database};` +
    `Trusted_Connection=yes;` +
    `Encrypt=yes;` +
    `TrustServerCertificate=yes;`;

  pool = new sql.ConnectionPool({
    connectionString,
    connectionTimeout: 15000,
    options: {
      encrypt: true,
      trustServerCertificate,
    },
  });
} else {
  sql = require("mssql");
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: normalizeServer(process.env.DB_SERVER),
    database: process.env.DB_DATABASE,
    options: {
      encrypt: process.env.DB_ENCRYPT === "true",
      trustServerCertificate,
    },
  };
  if (process.env.DB_PORT && String(process.env.DB_PORT).trim() !== "") {
    config.port = parseInt(process.env.DB_PORT, 10);
  }
  pool = new sql.ConnectionPool(config);
}

const poolConnect = pool.connect();

pool.on("error", (err) => {
  console.error("SQL pool error:", err);
});

module.exports = { pool, poolConnect, sql };
