require('dotenv').config({ path: __dirname + '/.env' }); // 🔥 FIX IMPORTANTE

console.log('👉 JWT_SECRET:', process.env.JWT_SECRET); // 🔍 DEBUG

const app = require('./src/app');
const { poolConnect } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

poolConnect.then(() => {
  console.log('✅ Conectado a SQL Server - FosilesDB');

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });

}).catch((err) => {
  console.error('❌ Error al conectar a la base de datos:', err);
  process.exit(1);
});