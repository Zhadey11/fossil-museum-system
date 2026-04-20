const { pool } = require("../../config/db");
const invService = require("../investigacion/investigacion.service");

const obtenerEstudios = async (query = {}, user = {}) => {
  const roles = user.roles || [];
  const isAdmin = roles.includes(1);
  const isInvestigador = roles.includes(2);
  if (!isAdmin && !isInvestigador) {
    const e = new Error("No autorizado");
    e.statusCode = 403;
    throw e;
  }

  const fosilId = query.fosil_id ? parseInt(query.fosil_id, 10) : null;
  if (!fosilId) {
    const e = new Error("fosil_id es obligatorio");
    e.statusCode = 400;
    throw e;
  }
  if (!isAdmin) {
    const ok = await invService.investigadorTieneAccesoAFosil(user.id, fosilId);
    if (!ok) {
      const e = new Error(
        "No tenés autorización para los estudios de este fósil. Solicitá acceso desde el panel de investigación.",
      );
      e.statusCode = 403;
      throw e;
    }
  }

  const req = pool.request();
  let where = "WHERE e.deleted_at IS NULL";
  if (fosilId) {
    where += " AND e.fosil_id = @fosil_id";
    req.input("fosil_id", fosilId);
  }
  const result = await req.query(`
    SELECT
      e.id,
      e.fosil_id,
      e.investigador_id,
      e.titulo,
      e.contexto_objetivo,
      e.tipo_analisis,
      e.resultados,
      e.composicion,
      e.condiciones_hallazgo,
      e.informacion_adicional,
      e.documentacion_contacto,
      e.publicado,
      e.created_at,
      u.nombre AS investigador_nombre,
      u.apellido AS investigador_apellido,
      u.email AS investigador_email,
      u.pais AS investigador_pais,
      u.profesion AS investigador_profesion,
      (
        SELECT r.id, r.titulo, r.url, r.tipo, r.autores, r.anio
        FROM REFERENCIA_ESTUDIO r
        WHERE r.estudio_id = e.id
        FOR JSON PATH
      ) AS referencias_json
    FROM ESTUDIO_CIENTIFICO e
    INNER JOIN USUARIO u ON u.id = e.investigador_id
    ${where}
    ORDER BY e.created_at DESC
  `);
  return result.recordset.map((row) => ({
    ...row,
    referencias: row.referencias_json ? JSON.parse(row.referencias_json) : [],
  }));
};

module.exports = { obtenerEstudios };
