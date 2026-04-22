-- Diagnóstico: por qué el catálogo web muestra 0 fósiles
-- Ejecutar en SSMS / Azure Data Studio contra FosilesDB
USE FosilesDB;
GO

PRINT N'--- 1) Prerequisitos del script 07 (si falta alguno, 07 hace ROLLBACK y no carga fósiles) ---';
SELECT N'admin@' AS u, (SELECT TOP 1 id FROM dbo.USUARIO WHERE email = N'admin@stonewake.org' AND deleted_at IS NULL) AS id_existe
UNION ALL
SELECT N'explorador@', (SELECT TOP 1 id FROM dbo.USUARIO WHERE email = N'explorador@stonewake.org' AND deleted_at IS NULL)
UNION ALL
SELECT N'miguel@', (SELECT TOP 1 id FROM dbo.USUARIO WHERE email = N'miguel@stonewake.org' AND deleted_at IS NULL);
SELECT N'Canton San Jose Centro (CRI)' AS dato,
  (SELECT TOP 1 c.id FROM dbo.CANTON c
   INNER JOIN dbo.PROVINCIA p ON p.id = c.provincia_id
   INNER JOIN dbo.PAIS pa ON pa.id = p.pais_id
   WHERE c.nombre = N'San Jose Centro' AND pa.codigo_iso = N'CRI') AS id_existe;
SELECT N'Era Mesozoico' AS dato, (SELECT TOP 1 id FROM dbo.ERA_GEOLOGICA WHERE nombre = N'Mesozoico') AS id;
SELECT N'Periodo Cretacico' AS dato,
  (SELECT TOP 1 pg.id FROM dbo.PERIODO_GEOLOGICO pg
   INNER JOIN dbo.ERA_GEOLOGICA e ON e.id = pg.era_id
   WHERE pg.nombre = N'Cretacico' AND e.nombre = N'Mesozoico') AS id;
GO

PRINT N'--- 2) Fósiles por estado (el catálogo SOLO usa estado = publicado) ---';
SELECT f.estado, COUNT(*) AS cantidad
FROM dbo.FOSIL f
WHERE f.deleted_at IS NULL
GROUP BY f.estado;
GO

PRINT N'--- 3) Misma lógica que el API (publicado + imagen) ---';
SELECT COUNT(*) AS filas_que_deberia_ver_el_catalogo
FROM dbo.MULTIMEDIA m
INNER JOIN dbo.FOSIL f ON f.id = m.fosil_id
WHERE m.deleted_at IS NULL
  AND f.deleted_at IS NULL
  AND f.estado = N'publicado'
  AND m.tipo = N'imagen';
GO

PRINT N'--- 4) Resumen ---';
-- Si 3) = 0: ejecutá en orden 01-08 (ORDEN_EJECUCION.txt). El 05 crea usuarios; el 07 inserta fósiles + multimedia.
-- Si 2) solo muestra "pendiente": publicá fósiles o re-ejecutá 07-08.
GO
