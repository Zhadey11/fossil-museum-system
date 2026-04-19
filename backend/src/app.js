const express = require('express');
const cors = require('cors');

// 🔥 rutas
const fosilesRoutes = require('./modules/fosiles/fosiles.routes');
const authRoutes = require('./modules/auth/auth.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const multimediaRoutes = require('./modules/multimedia/multimedia.routes');
const taxonomiaRoutes = require('./modules/taxonomia/taxonomia.routes');
const geologiaRoutes = require('./modules/geologia/geologia.routes');
const ubicacionRoutes = require('./modules/ubicacion/ubicacion.routes');
const estudiosRoutes = require('./modules/estudios/estudios.routes');
const contactoRoutes = require('./modules/contacto/contacto.routes');


const app = express();

// 🔧 middlewares
app.use(cors());
app.use(express.json());

// 📸 SERVIR ARCHIVOS
app.use('/uploads', express.static('uploads'));

// 🧪 health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


// 🛣️ rutas
app.use('/api/fosiles', fosilesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/taxonomia', taxonomiaRoutes);
app.use('/api/geologia', geologiaRoutes);
app.use('/api/ubicacion', ubicacionRoutes);
app.use('/api/estudios', estudiosRoutes);
app.use('/api/contacto', contactoRoutes);


module.exports = app;