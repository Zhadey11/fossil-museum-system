/**
 * Genera bcrypt (cost 10) para cargar en USUARIO.password_hash (variable @h en 05_datos_prueba.sql o UPDATE).
 * Uso: node scripts/gen-hash.js "TuContraseñaSegura"
 */
const bcrypt = require("bcrypt");

const pwd = process.argv[2];
if (!pwd || String(pwd).length < 8) {
  console.error("Uso: node scripts/gen-hash.js \"<contraseña>\" (mínimo 8 caracteres)");
  process.exit(1);
}

bcrypt
  .hash(pwd, 10)
  .then((h) => {
    console.log("hash:", h);
    return bcrypt.compare(pwd, h);
  })
  .then((ok) => console.log("verify:", ok))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
