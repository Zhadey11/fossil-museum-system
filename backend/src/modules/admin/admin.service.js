const { pool } = require('../../config/db');

// ✅ APROBAR
const aprobarFosil = async (id, adminId) => {
  await pool.request()
    .input('id', id)
    .input('admin_id', adminId)
    .query(`
      UPDATE FOSIL
      SET estado = 'publicado',
          administrador_id = @admin_id,
          updated_at = GETDATE()
      WHERE id = @id
    `);

  return { mensaje: 'Fósil aprobado ✅' };
};

// ❌ RECHAZAR
const rechazarFosil = async (id, adminId) => {
  await pool.request()
    .input('id', id)
    .input('admin_id', adminId)
    .query(`
      UPDATE FOSIL
      SET estado = 'rechazado',
          administrador_id = @admin_id,
          updated_at = GETDATE()
      WHERE id = @id
    `);

  return { mensaje: 'Fósil rechazado ❌' };
};

// 📋 VER PENDIENTES
const obtenerPendientes = async () => {
  const result = await pool.request().query(`
    SELECT id, nombre, estado, created_at
    FROM FOSIL
    WHERE estado = 'pendiente' AND deleted_at IS NULL
  `);

  return result.recordset;
};

module.exports = {
  aprobarFosil,
  rechazarFosil,
  obtenerPendientes
};