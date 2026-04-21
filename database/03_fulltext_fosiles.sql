/*
  Full-Text: catálogo e índices en FOSIL y TAXONOMIA.
  Orden: ejecutar después de 02_tablas_principales.sql y antes de 04_indices_vistas_sp.sql
  (los SP de búsqueda usan CONTAINS/FREETEXT en modos 0 y 1).
*/
USE FosilesDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = N'FosilesCatalog')
BEGIN
    CREATE FULLTEXT CATALOG FosilesCatalog AS DEFAULT;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID(N'dbo.FOSIL', N'U')
)
BEGIN
    CREATE FULLTEXT INDEX ON FOSIL (
        nombre,
        nombre_comun,
        nombre_cientifico,
        descripcion_general,
        descripcion_detallada,
        descripcion_estado_orig,
        contexto_geologico,
        descripcion_ubicacion,
        notas_revision
    )
    KEY INDEX PK_FOSIL
    ON FosilesCatalog
    WITH STOPLIST = SYSTEM, CHANGE_TRACKING AUTO;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID(N'dbo.TAXONOMIA', N'U')
)
BEGIN
    CREATE FULLTEXT INDEX ON TAXONOMIA (
        reino,
        filo,
        clase,
        orden,
        familia,
        genero,
        especie
    )
    KEY INDEX PK_TAXONOMIA
    ON FosilesCatalog
    WITH STOPLIST = SYSTEM, CHANGE_TRACKING AUTO;
END
GO
