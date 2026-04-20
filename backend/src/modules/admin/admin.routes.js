const express = require('express');
const router = express.Router();

const auth = require('../../middlewares/auth');
const checkRole = require('../../middlewares/roles');

const {
  aprobar,
  rechazar,
  pendientes,
  papelera,
  restaurarUsuario,
  restaurarFosil,
  restaurarContacto,
} = require('./admin.controller');

const inv = require('../investigacion/investigacion.controller');

router.get('/fosiles/pendientes', auth, checkRole([1]), pendientes);
router.patch('/fosiles/:id/aprobar', auth, checkRole([1]), aprobar);
router.patch('/fosiles/:id/rechazar', auth, checkRole([1]), rechazar);
router.get('/papelera', auth, checkRole([1]), papelera);
router.patch('/papelera/usuarios/:id/restaurar', auth, checkRole([1]), restaurarUsuario);
router.patch('/papelera/fosiles/:id/restaurar', auth, checkRole([1]), restaurarFosil);
router.patch('/papelera/contacto/:id/restaurar', auth, checkRole([1]), restaurarContacto);

router.get('/investigacion/solicitudes', auth, checkRole([1]), inv.listarPendientesAdmin);
router.patch('/investigacion/solicitudes/:id/aprobar', auth, checkRole([1]), inv.aprobar);
router.patch('/investigacion/solicitudes/:id/rechazar', auth, checkRole([1]), inv.rechazar);

module.exports = router;