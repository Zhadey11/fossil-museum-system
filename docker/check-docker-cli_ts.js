/**
 * Comprueba que exista Docker CLI y el plugin Compose v2.
 * Uso: node docker/check-docker-cli.js
 */
const { spawnSync } = require("child_process");

function run(cmd, args) {
  return spawnSync(cmd, args, { encoding: "utf8", shell: true });
}

const compose = run("docker", ["compose", "version"]);
if (compose.status === 0) {
  process.exit(0);
}

const dockerOnly = run("docker", ["version"]);
if (dockerOnly.status !== 0) {
  console.error(`
No se encontró el comando "docker" en el PATH.

En Windows:
  1) Instalá Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/
  2) Abrí Docker Desktop y esperá a que diga que está corriendo.
  3) Cerrá y volvé a abrir PowerShell o Cursor (para que cargue el PATH).

Comprobación manual:
  docker version
  docker compose version
`);
} else {
  console.error(`
Docker está instalado pero falló "docker compose version" (hace falta Docker Compose v2, incluido en Docker Desktop).

Si usás una instalación antigua, actualizá Docker Desktop o instalá el plugin Compose.
`);
}

process.exit(1);
