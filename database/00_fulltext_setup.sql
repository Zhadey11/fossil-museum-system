USE FosilesDB;
GO

-- Crear el catalogo Full-Text
CREATE FULLTEXT CATALOG FosilesCatalog AS DEFAULT;
GO

-- Crear el Full-Text Index en la tabla FOSIL
CREATE FULLTEXT INDEX ON FOSIL(
    nombre,
    descripcion_general,
    descripcion_detallada,
    descripcion_estado_orig,
    contexto_geologico,
    descripcion_ubicacion,
    notas_revision
)
KEY INDEX PK_FOSIL
ON FosilesCatalog;
GO

-- Crear el Full-Text Index en la tabla TAXONOMIA
CREATE FULLTEXT INDEX ON TAXONOMIA(
    reino,
    filo,
    clase,
    orden,
    familia,
    genero,
    especie
)
KEY INDEX PK_TAXONOMIA
ON FosilesCatalog;
GO
