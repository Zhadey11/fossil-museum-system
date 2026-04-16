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
