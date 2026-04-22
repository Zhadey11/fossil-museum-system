/**
 * Prepara entornos antes de `docker compose up`:
 * - `docker/compose.env` (variables para SQL / compose) desde `docker/compose.env.example` o valores por defecto
 * - `backend/.env` desde `backend/.env.example` si aún no existe
 *
 * Uso: node docker/prepare.js
 */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function ensureFile(targetPath, contentUtf8) {
  if (fs.existsSync(targetPath)) return false;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, contentUtf8, "utf8");
  return true;
}

// --- docker/compose.env (lo usa: docker compose --env-file docker/compose.env) ---
const composeEnvPath = path.join(ROOT, "docker", "compose.env");
const composeEnvExample = path.join(ROOT, "docker", "compose.env.example");

if (!fs.existsSync(composeEnvPath)) {
  if (fs.existsSync(composeEnvExample)) {
    fs.copyFileSync(composeEnvExample, composeEnvPath);
    console.log("docker/prepare: creado docker/compose.env desde docker/compose.env.example");
  } else {
    ensureFile(
      composeEnvPath,
      [
        "# Generado por docker/prepare.js — podés ajustar y alinear con tu docker-compose",
        "MSSQL_SA_PASSWORD=FossilMuseum2026!Strong",
        "",
      ].join("\n"),
    );
    console.log(
      "docker/prepare: creado docker/compose.env con contraseña por defecto (revisá y alineá con SQL Server en compose).",
    );
  }
} else {
  console.log("docker/prepare: docker/compose.env ya existe, no se toca.");
}

// --- backend/.env (desarrollo local; en Docker el compose suele sobreescribir con env_file) ---
const backendEnv = path.join(ROOT, "backend", ".env");
const backendEnvExample = path.join(ROOT, "backend", ".env.example");

if (!fs.existsSync(backendEnv) && fs.existsSync(backendEnvExample)) {
  fs.copyFileSync(backendEnvExample, backendEnv);
  console.log("docker/prepare: creado backend/.env desde backend/.env.example");
} else if (fs.existsSync(backendEnv)) {
  console.log("docker/prepare: backend/.env ya existe, no se toca.");
} else {
  console.warn(
    "docker/prepare: no hay backend/.env.example; no se creó backend/.env.",
  );
}

console.log("docker/prepare: listo.");
