USE FosilesDB;
GO

DROP INDEX IF EXISTS IX_FOSIL_estado          ON FOSIL;
DROP INDEX IF EXISTS IX_FOSIL_categoria_estado ON FOSIL;
DROP INDEX IF EXISTS IX_FOSIL_era_periodo      ON FOSIL;
DROP INDEX IF EXISTS IX_FOSIL_canton           ON FOSIL;
DROP INDEX IF EXISTS IX_FOSIL_explorador       ON FOSIL;
DROP INDEX IF EXISTS IX_FOSIL_nombre           ON FOSIL;
DROP INDEX IF EXISTS IX_FOSIL_pendientes       ON FOSIL;
DROP INDEX IF EXISTS IX_USUARIO_email          ON USUARIO;
DROP INDEX IF EXISTS IX_USUARIO_rol            ON USUARIO;
DROP INDEX IF EXISTS IX_MULTI_FOSIL            ON MULTIMEDIA;
DROP INDEX IF EXISTS IX_MULTI_PRINCIPAL        ON MULTIMEDIA;
DROP INDEX IF EXISTS IX_ESTUDIO_FOSIL          ON ESTUDIO_CIENTIFICO;
DROP INDEX IF EXISTS IX_PERIODO_ERA            ON PERIODO_GEOLOGICO;
DROP INDEX IF EXISTS IX_LOG_USR                ON LOG_AUDITORIA;
DROP INDEX IF EXISTS IX_LOG_REG                ON LOG_AUDITORIA;
DROP INDEX IF EXISTS IX_USUARIO_ROL_usuario    ON USUARIO_ROL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_estado
    ON FOSIL (estado) INCLUDE (id, nombre, codigo_unico, slug, categoria_id, canton_id)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_categoria_estado
    ON FOSIL (categoria_id, estado) INCLUDE (nombre, codigo_unico, fecha_hallazgo, latitud, longitud)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_era_periodo
    ON FOSIL (era_id, periodo_id, estado) INCLUDE (nombre, codigo_unico, categoria_id)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_canton
    ON FOSIL (canton_id, estado) INCLUDE (nombre, latitud, longitud)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_explorador
    ON FOSIL (explorador_id, estado) INCLUDE (nombre, codigo_unico, created_at)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_nombre
    ON FOSIL (nombre) INCLUDE (id, codigo_unico, estado, categoria_id)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_FOSIL_pendientes
    ON FOSIL (estado, created_at) INCLUDE (nombre, explorador_id, canton_id)
    WHERE estado IN ('pendiente','en_revision') AND deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_USUARIO_email
    ON USUARIO (email) INCLUDE (id, rol_id, nombre, apellido, activo)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_USUARIO_rol
    ON USUARIO (rol_id, activo) INCLUDE (nombre, apellido, email)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_MULTI_FOSIL
    ON MULTIMEDIA (fosil_id, tipo, subtipo) INCLUDE (url, es_principal, orden)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_MULTI_PRINCIPAL
    ON MULTIMEDIA (fosil_id, es_principal) INCLUDE (url, tipo)
    WHERE es_principal = 1 AND deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_ESTUDIO_FOSIL
    ON ESTUDIO_CIENTIFICO (fosil_id, publicado) INCLUDE (titulo, investigador_id, created_at)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_PERIODO_ERA
    ON PERIODO_GEOLOGICO (era_id) INCLUDE (nombre);
GO

CREATE NONCLUSTERED INDEX IX_LOG_USR
    ON LOG_AUDITORIA (usuario_id, created_at DESC) INCLUDE (accion, tabla_afectada, registro_id);
GO

CREATE NONCLUSTERED INDEX IX_LOG_REG
    ON LOG_AUDITORIA (tabla_afectada, registro_id, created_at DESC);
GO

CREATE NONCLUSTERED INDEX IX_USUARIO_ROL_usuario
    ON USUARIO_ROL (usuario_id, activo) INCLUDE (rol_id);
GO

CREATE OR ALTER VIEW VW_FOSILES_PUBLICOS AS
SELECT
    f.id, f.codigo_unico, f.nombre, f.slug, f.descripcion_general,
    f.fecha_hallazgo, f.latitud, f.longitud, f.created_at,
    cf.nombre AS categoria_nombre,
    cf.codigo AS categoria_codigo,
    p.nombre  AS pais_nombre,
    pv.nombre AS provincia_nombre,
    c.nombre  AS canton_nombre,
    eg.nombre AS era_nombre,
    pg.nombre AS periodo_nombre,
    t.reino   AS taxonomia_reino,
    t.especie AS taxonomia_especie,
    (SELECT TOP 1 url FROM MULTIMEDIA m
     WHERE m.fosil_id = f.id AND m.es_principal = 1 AND m.tipo = 'imagen' AND m.deleted_at IS NULL) AS imagen_principal,
    (SELECT COUNT(*) FROM MULTIMEDIA m
     WHERE m.fosil_id = f.id AND m.tipo = 'imagen' AND m.deleted_at IS NULL) AS total_imagenes
FROM FOSIL f
    INNER JOIN CATEGORIA_FOSIL   cf ON f.categoria_id = cf.id
    INNER JOIN CANTON              c ON f.canton_id    = c.id
    INNER JOIN PROVINCIA          pv ON c.provincia_id = pv.id
    INNER JOIN PAIS                p ON pv.pais_id     = p.id
    INNER JOIN ERA_GEOLOGICA      eg ON f.era_id       = eg.id
    INNER JOIN PERIODO_GEOLOGICO  pg ON f.periodo_id   = pg.id
    LEFT  JOIN TAXONOMIA           t ON f.taxonomia_id = t.id
WHERE f.estado = 'publicado' AND f.deleted_at IS NULL;
GO

CREATE OR ALTER VIEW VW_FOSILES_COMPLETOS AS
SELECT
    f.*,
    cf.nombre  AS categoria_nombre,
    cf.codigo  AS categoria_codigo,
    p.codigo_iso AS pais_codigo,
    p.nombre   AS pais_nombre,
    pv.codigo  AS provincia_codigo,
    pv.nombre  AS provincia_nombre,
    c.codigo   AS canton_codigo,
    c.nombre   AS canton_nombre,
    eg.nombre  AS era_nombre,
    eg.ma_inicio AS era_ma_inicio,
    eg.ma_fin    AS era_ma_fin,
    pg.nombre  AS periodo_nombre,
    pg.ma_inicio AS periodo_ma_inicio,
    pg.ma_fin    AS periodo_ma_fin,
    t.reino, t.filo, t.clase, t.orden, t.familia, t.genero, t.especie,
    ue.nombre + ' ' + ue.apellido AS explorador_nombre,
    ue.email                       AS explorador_email,
    ua.nombre + ' ' + ua.apellido AS administrador_nombre
FROM FOSIL f
    INNER JOIN CATEGORIA_FOSIL   cf ON f.categoria_id     = cf.id
    INNER JOIN CANTON              c ON f.canton_id        = c.id
    INNER JOIN PROVINCIA          pv ON c.provincia_id     = pv.id
    INNER JOIN PAIS                p ON pv.pais_id         = p.id
    INNER JOIN ERA_GEOLOGICA      eg ON f.era_id           = eg.id
    INNER JOIN PERIODO_GEOLOGICO  pg ON f.periodo_id       = pg.id
    LEFT  JOIN TAXONOMIA           t ON f.taxonomia_id     = t.id
    INNER JOIN USUARIO            ue ON f.explorador_id    = ue.id
    LEFT  JOIN USUARIO            ua ON f.administrador_id = ua.id
WHERE f.deleted_at IS NULL;
GO

CREATE OR ALTER VIEW VW_FOSILES_PENDIENTES AS
SELECT
    f.id, f.codigo_unico, f.nombre, f.estado, f.fecha_hallazgo,
    f.created_at AS fecha_registro, f.notas_revision,
    u.nombre + ' ' + u.apellido AS explorador_nombre,
    u.email    AS explorador_email,
    u.telefono AS explorador_telefono,
    pv.nombre  AS provincia_nombre,
    c.nombre   AS canton_nombre,
    cf.nombre  AS categoria_nombre,
    (SELECT COUNT(*) FROM MULTIMEDIA m
     WHERE m.fosil_id = f.id AND m.tipo = 'imagen' AND m.deleted_at IS NULL) AS total_fotos
FROM FOSIL f
    INNER JOIN USUARIO           u  ON f.explorador_id = u.id
    INNER JOIN CANTON             c  ON f.canton_id    = c.id
    INNER JOIN PROVINCIA         pv  ON c.provincia_id = pv.id
    INNER JOIN CATEGORIA_FOSIL   cf  ON f.categoria_id = cf.id
WHERE f.estado IN ('pendiente','en_revision') AND f.deleted_at IS NULL;
GO

CREATE OR ALTER VIEW VW_ESTADISTICAS AS
SELECT
    (SELECT COUNT(*) FROM FOSIL WHERE deleted_at IS NULL)                              AS total_fosiles,
    (SELECT COUNT(*) FROM FOSIL WHERE estado='publicado' AND deleted_at IS NULL)       AS publicados,
    (SELECT COUNT(*) FROM FOSIL WHERE estado='pendiente' AND deleted_at IS NULL)       AS pendientes,
    (SELECT COUNT(*) FROM FOSIL WHERE estado='rechazado' AND deleted_at IS NULL)       AS rechazados,
    (SELECT COUNT(*) FROM USUARIO WHERE deleted_at IS NULL AND activo=1)               AS total_usuarios,
    (SELECT COUNT(*) FROM USUARIO u INNER JOIN ROL r ON u.rol_id=r.id
     WHERE r.nombre='investigador' AND u.deleted_at IS NULL)                           AS investigadores,
    (SELECT COUNT(*) FROM USUARIO u INNER JOIN ROL r ON u.rol_id=r.id
     WHERE r.nombre='explorador' AND u.deleted_at IS NULL)                             AS exploradores,
    (SELECT COUNT(*) FROM MULTIMEDIA WHERE tipo='imagen' AND deleted_at IS NULL)       AS total_imagenes,
    (SELECT COUNT(*) FROM ESTUDIO_CIENTIFICO WHERE publicado=1 AND deleted_at IS NULL) AS estudios_publicados;
GO

CREATE OR ALTER VIEW VW_USUARIOS_CON_ROLES AS
SELECT
    u.id,
    u.nombre,
    u.apellido,
    u.email,
    u.telefono,
    u.pais,
    u.profesion,
    u.centro_trabajo,
    u.activo,
    u.created_at,
    u.updated_at,
    u.deleted_at,
    u.rol_id          AS rol_principal_id,
    rp.nombre         AS rol_principal,
    (
        SELECT STRING_AGG(r.nombre, ',')
        FROM USUARIO_ROL ur
        INNER JOIN ROL r ON ur.rol_id = r.id
        WHERE ur.usuario_id = u.id AND ur.activo = 1
    ) AS todos_los_roles,
    CASE WHEN EXISTS (
        SELECT 1 FROM USUARIO_ROL ur INNER JOIN ROL r ON ur.rol_id = r.id
        WHERE ur.usuario_id = u.id AND r.nombre = 'administrador' AND ur.activo = 1
    ) THEN 1 ELSE 0 END AS es_administrador,
    CASE WHEN EXISTS (
        SELECT 1 FROM USUARIO_ROL ur INNER JOIN ROL r ON ur.rol_id = r.id
        WHERE ur.usuario_id = u.id AND r.nombre = 'investigador' AND ur.activo = 1
    ) THEN 1 ELSE 0 END AS es_investigador,
    CASE WHEN EXISTS (
        SELECT 1 FROM USUARIO_ROL ur INNER JOIN ROL r ON ur.rol_id = r.id
        WHERE ur.usuario_id = u.id AND r.nombre = 'explorador' AND ur.activo = 1
    ) THEN 1 ELSE 0 END AS es_explorador,
    CASE WHEN EXISTS (
        SELECT 1 FROM USUARIO_ROL ur INNER JOIN ROL r ON ur.rol_id = r.id
        WHERE ur.usuario_id = u.id AND r.nombre = 'publico' AND ur.activo = 1
    ) THEN 1 ELSE 0 END AS es_publico
FROM USUARIO u
INNER JOIN ROL rp ON u.rol_id = rp.id
WHERE u.deleted_at IS NULL;
GO

CREATE OR ALTER PROCEDURE sp_generar_codigo_fosil
    @canton_id    INT,
    @categoria_id INT,
    @codigo_unico VARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE
        @pais_codigo      CHAR(3),
        @provincia_codigo VARCHAR(5),
        @canton_codigo    VARCHAR(5),
        @categoria_codigo CHAR(3),
        @siguiente_id     INT;

    SELECT
        @pais_codigo      = p.codigo_iso,
        @provincia_codigo = pv.codigo,
        @canton_codigo    = c.codigo
    FROM CANTON c
        INNER JOIN PROVINCIA pv ON c.provincia_id = pv.id
        INNER JOIN PAIS       p ON pv.pais_id     = p.id
    WHERE c.id = @canton_id;

    SELECT @categoria_codigo = codigo FROM CATEGORIA_FOSIL WHERE id = @categoria_id;

    IF @pais_codigo IS NULL OR @categoria_codigo IS NULL
        THROW 50001, 'Canton o categoria no validos.', 1;

    SELECT @siguiente_id = ISNULL(MAX(TRY_CAST(RIGHT(f.codigo_unico, 5) AS INT)), 0) + 1
    FROM FOSIL f
    WHERE f.canton_id = @canton_id AND f.categoria_id = @categoria_id;

    SET @codigo_unico = CONCAT(
        @pais_codigo,      '-',
        @provincia_codigo, '-',
        @canton_codigo,    '-',
        @categoria_codigo, '-',
        RIGHT('00000' + CAST(@siguiente_id AS VARCHAR), 5)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_registrar_fosil
    @canton_id             INT,
    @categoria_id          INT,
    @era_id                INT,
    @periodo_id            INT,
    @explorador_id         INT,
    @nombre                VARCHAR(255),
    @descripcion_general   VARCHAR(MAX),
    @latitud               DECIMAL(10,7) = NULL,
    @longitud              DECIMAL(10,7) = NULL,
    @altitud_msnm          DECIMAL(8,2)  = NULL,
    @descripcion_ubicacion VARCHAR(500)  = NULL,
    @fecha_hallazgo        DATE          = NULL,
    @nuevo_id              INT           OUTPUT,
    @nuevo_codigo          VARCHAR(30)   OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        EXEC sp_generar_codigo_fosil
            @canton_id    = @canton_id,
            @categoria_id = @categoria_id,
            @codigo_unico = @nuevo_codigo OUTPUT;

        DECLARE @slug VARCHAR(300);
        SET @slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            @nombre,' ','-'),'á','a'),'é','e'),'í','i'),'ó','o'))
            + '-' + REPLACE(@nuevo_codigo,'-','');

        INSERT INTO FOSIL (
            codigo_unico, canton_id, categoria_id, era_id, periodo_id,
            explorador_id, nombre, slug, descripcion_general,
            latitud, longitud, altitud_msnm, descripcion_ubicacion,
            fecha_hallazgo, estado
        ) VALUES (
            @nuevo_codigo, @canton_id, @categoria_id, @era_id, @periodo_id,
            @explorador_id, @nombre, @slug, @descripcion_general,
            @latitud, @longitud, @altitud_msnm, @descripcion_ubicacion,
            @fecha_hallazgo, 'pendiente'
        );

        SET @nuevo_id = SCOPE_IDENTITY();

        INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
        VALUES (@explorador_id, 'FOSIL', @nuevo_id, 'INSERT',
            (SELECT @nombre AS nombre, 'pendiente' AS estado FOR JSON PATH, WITHOUT_ARRAY_WRAPPER));

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_actualizar_fosil
    @fosil_id                      INT,
    @usuario_id                    INT,
    @validar_rol                   BIT = 0,
    @nombre                        VARCHAR(255)  = NULL,
    @descripcion_general           VARCHAR(MAX)  = NULL,
    @descripcion_detallada         VARCHAR(MAX)  = NULL,
    @aplicar_descripcion_detallada BIT = 0,
    @categoria_id                  INT           = NULL,
    @era_id                        INT           = NULL,
    @periodo_id                    INT           = NULL,
    @taxonomia_id                  INT           = NULL,
    @aplicar_taxonomia             BIT = 0,
    @canton_id                     INT           = NULL,
    @latitud                       DECIMAL(10,7) = NULL,
    @longitud                      DECIMAL(10,7) = NULL,
    @altitud_msnm                  DECIMAL(8,2)  = NULL,
    @actualizar_coordenadas        BIT = 0,
    @descripcion_ubicacion         VARCHAR(500)  = NULL,
    @estado                        VARCHAR(20)   = NULL,
    @slug                          VARCHAR(300)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @audit_ctx SQL_VARIANT;

        IF NOT EXISTS (SELECT 1 FROM FOSIL WHERE id = @fosil_id AND deleted_at IS NULL)
            THROW 50020, 'Fosil no encontrado o eliminado.', 1;

        IF @validar_rol = 1
        BEGIN
            IF @estado IS NOT NULL
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM USUARIO u INNER JOIN ROL r ON u.rol_id = r.id
                    WHERE u.id = @usuario_id AND r.nombre = 'administrador' AND u.deleted_at IS NULL
                )
                    THROW 50021, 'Solo administrador puede cambiar el estado.', 1;
            END
            ELSE IF NOT EXISTS (
                SELECT 1 FROM USUARIO u INNER JOIN ROL r ON u.rol_id = r.id
                WHERE u.id = @usuario_id AND u.deleted_at IS NULL
                  AND (
                      r.nombre = 'administrador'
                      OR (
                          r.nombre = 'explorador'
                          AND EXISTS (
                              SELECT 1 FROM FOSIL f
                              WHERE f.id = @fosil_id AND f.explorador_id = @usuario_id
                          )
                      )
                  )
            )
                THROW 50022, 'Sin permiso para editar este fosil.', 1;
        END

        IF @slug IS NOT NULL
           AND EXISTS (SELECT 1 FROM FOSIL WHERE slug = @slug AND id <> @fosil_id)
            THROW 50023, 'El slug ya esta en uso.', 1;

        SET @audit_ctx = CONVERT(SQL_VARIANT, @usuario_id);
        EXEC sys.sp_set_session_context @key = N'audit_user_id', @value = @audit_ctx;

        UPDATE FOSIL SET
            nombre                = ISNULL(@nombre, nombre),
            descripcion_general   = ISNULL(@descripcion_general, descripcion_general),
            descripcion_detallada = CASE WHEN @aplicar_descripcion_detallada = 1
                THEN @descripcion_detallada ELSE descripcion_detallada END,
            categoria_id          = ISNULL(@categoria_id, categoria_id),
            era_id                = ISNULL(@era_id, era_id),
            periodo_id            = ISNULL(@periodo_id, periodo_id),
            taxonomia_id          = CASE WHEN @aplicar_taxonomia = 1
                THEN @taxonomia_id ELSE taxonomia_id END,
            canton_id             = ISNULL(@canton_id, canton_id),
            latitud               = CASE WHEN @actualizar_coordenadas = 1 THEN @latitud       ELSE latitud      END,
            longitud              = CASE WHEN @actualizar_coordenadas = 1 THEN @longitud      ELSE longitud     END,
            altitud_msnm          = CASE WHEN @actualizar_coordenadas = 1 THEN @altitud_msnm  ELSE altitud_msnm END,
            descripcion_ubicacion = ISNULL(@descripcion_ubicacion, descripcion_ubicacion),
            estado                = ISNULL(@estado, estado),
            slug                  = ISNULL(@slug, slug),
            updated_at            = GETDATE()
        WHERE id = @fosil_id AND deleted_at IS NULL;

        EXEC sys.sp_set_session_context @key = N'audit_user_id', @value = NULL;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        EXEC sys.sp_set_session_context @key = N'audit_user_id', @value = NULL;
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_cambiar_estado_fosil
    @fosil_id      INT,
    @nuevo_estado  VARCHAR(20),
    @admin_id      INT,
    @notas         VARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @estado_anterior VARCHAR(20),
                @skip_audit_ctx SQL_VARIANT = CONVERT(SQL_VARIANT, N'1');

        SELECT @estado_anterior = estado
        FROM FOSIL
        WHERE id = @fosil_id AND deleted_at IS NULL;

        IF @estado_anterior IS NULL
            THROW 50002, 'Fosil no encontrado o eliminado.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM USUARIO u INNER JOIN ROL r ON u.rol_id = r.id
            WHERE u.id = @admin_id AND r.nombre = 'administrador' AND u.deleted_at IS NULL
        )
            THROW 50003, 'El usuario no tiene permisos de administrador.', 1;

        EXEC sys.sp_set_session_context @key = N'skip_fosil_update_audit', @value = @skip_audit_ctx;

        UPDATE FOSIL SET
            estado           = @nuevo_estado,
            administrador_id = @admin_id,
            notas_revision   = @notas,
            fecha_aprobacion = CASE WHEN @nuevo_estado = 'publicado' THEN GETDATE() ELSE NULL END,
            updated_at       = GETDATE()
        WHERE id = @fosil_id;

        EXEC sys.sp_set_session_context @key = N'skip_fosil_update_audit', @value = NULL;

        INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos)
        VALUES (@admin_id, 'FOSIL', @fosil_id, 'UPDATE',
            (SELECT @estado_anterior AS estado FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT @nuevo_estado    AS estado FOR JSON PATH, WITHOUT_ARRAY_WRAPPER));

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        EXEC sys.sp_set_session_context @key = N'skip_fosil_update_audit', @value = NULL;
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_soft_delete_fosil
    @fosil_id INT,
    @admin_id INT,
    @motivo   VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @skip_del_ctx SQL_VARIANT = CONVERT(SQL_VARIANT, N'1');

        IF NOT EXISTS (SELECT 1 FROM FOSIL WHERE id = @fosil_id AND deleted_at IS NULL)
            THROW 50004, 'Fosil no encontrado o ya eliminado.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM USUARIO u INNER JOIN ROL r ON u.rol_id = r.id
            WHERE u.id = @admin_id AND r.nombre = 'administrador' AND u.deleted_at IS NULL
        )
            THROW 50005, 'El usuario no tiene permisos de administrador.', 1;

        EXEC sys.sp_set_session_context @key = N'skip_fosil_update_audit', @value = @skip_del_ctx;

        UPDATE FOSIL SET
            deleted_at = GETDATE(),
            updated_at = GETDATE(),
            estado     = 'rechazado'
        WHERE id = @fosil_id;

        EXEC sys.sp_set_session_context @key = N'skip_fosil_update_audit', @value = NULL;

        INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
        VALUES (@admin_id, 'FOSIL', @fosil_id, 'SOFT_DELETE',
            (SELECT ISNULL(@motivo, 'Sin motivo') AS motivo FOR JSON PATH, WITHOUT_ARRAY_WRAPPER));

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        EXEC sys.sp_set_session_context @key = N'skip_fosil_update_audit', @value = NULL;
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_obtener_fosil_por_id
    @fosil_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM VW_FOSILES_COMPLETOS WHERE id = @fosil_id;
END
GO

CREATE OR ALTER PROCEDURE sp_buscar_fosiles
    @nombre        VARCHAR(255) = NULL,
    @categoria_id  INT          = NULL,
    @era_id        INT          = NULL,
    @periodo_id    INT          = NULL,
    @canton_id     INT          = NULL,
    @solo_publico  BIT          = 1,
    @pagina        INT          = 1,
    @por_pagina    INT          = 12,
    @modo_busqueda TINYINT      = 1
AS
BEGIN
    SET NOCOUNT ON;

    IF @modo_busqueda NOT IN (0, 1, 2)
        SET @modo_busqueda = 1;

    DECLARE @offset    INT          = (@pagina - 1) * @por_pagina;
    DECLARE @search_ft NVARCHAR(4000) = NULL;
    DECLARE @busqueda_vacia BIT    = 0;

    IF @nombre IS NOT NULL
    BEGIN
        SET @search_ft = LTRIM(RTRIM(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ISNULL(@nombre, N''),
                N'"', N' '), N'&', N' '), N'|', N' '), N'(', N' '), N')', N' ')
        ));
        IF LEN(@search_ft) = 0
            SET @busqueda_vacia = 1;
    END;

    SELECT
        f.id, f.codigo_unico, f.nombre, f.slug, f.descripcion_general,
        f.estado, f.fecha_hallazgo, f.latitud, f.longitud,
        cf.nombre AS categoria_nombre,
        eg.nombre AS era_nombre,
        pg.nombre AS periodo_nombre,
        pv.nombre AS provincia_nombre,
        c.nombre  AS canton_nombre,
        (
            SELECT TOP 1 url FROM MULTIMEDIA m
            WHERE m.fosil_id = f.id AND m.es_principal = 1 AND m.tipo = 'imagen' AND m.deleted_at IS NULL
        ) AS imagen_principal,
        COUNT(*) OVER() AS total_resultados
    FROM FOSIL f
        INNER JOIN CATEGORIA_FOSIL   cf ON f.categoria_id = cf.id
        INNER JOIN ERA_GEOLOGICA      eg ON f.era_id       = eg.id
        INNER JOIN PERIODO_GEOLOGICO  pg ON f.periodo_id   = pg.id
        INNER JOIN CANTON              c ON f.canton_id    = c.id
        INNER JOIN PROVINCIA          pv ON c.provincia_id = pv.id
        LEFT  JOIN TAXONOMIA           t ON f.taxonomia_id = t.id
    WHERE
        f.deleted_at IS NULL
        AND (@solo_publico = 0 OR f.estado = 'publicado')
        AND (@nombre IS NULL OR @busqueda_vacia = 0)
        AND (
            @nombre IS NULL
            OR (
                @modo_busqueda = 0
                AND (
                    CONTAINS((f.nombre, f.descripcion_general, f.descripcion_detallada,
                               f.descripcion_estado_orig, f.contexto_geologico,
                               f.descripcion_ubicacion, f.notas_revision), @search_ft)
                    OR (t.id IS NOT NULL AND CONTAINS((
                            t.reino, t.filo, t.clase, t.orden, t.familia, t.genero, t.especie
                        ), @search_ft))
                )
            )
            OR (
                @modo_busqueda = 1
                AND (
                    FREETEXT((f.nombre, f.descripcion_general, f.descripcion_detallada,
                               f.descripcion_estado_orig, f.contexto_geologico,
                               f.descripcion_ubicacion, f.notas_revision), @search_ft)
                    OR (t.id IS NOT NULL AND FREETEXT((
                            t.reino, t.filo, t.clase, t.orden, t.familia, t.genero, t.especie
                        ), @search_ft))
                )
            )
            OR (
                @modo_busqueda = 2
                AND (
                    CHARINDEX(@nombre, f.nombre) > 0
                    OR CHARINDEX(@nombre, f.descripcion_general) > 0
                    OR (f.descripcion_detallada  IS NOT NULL AND CHARINDEX(@nombre, f.descripcion_detallada)  > 0)
                    OR (f.descripcion_estado_orig IS NOT NULL AND CHARINDEX(@nombre, f.descripcion_estado_orig) > 0)
                    OR (f.contexto_geologico      IS NOT NULL AND CHARINDEX(@nombre, f.contexto_geologico)      > 0)
                    OR (f.descripcion_ubicacion   IS NOT NULL AND CHARINDEX(@nombre, f.descripcion_ubicacion)   > 0)
                    OR (f.notas_revision          IS NOT NULL AND CHARINDEX(@nombre, f.notas_revision)          > 0)
                    OR (t.id IS NOT NULL AND (
                        CHARINDEX(@nombre, t.reino)   > 0 OR CHARINDEX(@nombre, t.filo)    > 0 OR
                        CHARINDEX(@nombre, t.clase)   > 0 OR CHARINDEX(@nombre, t.orden)   > 0 OR
                        CHARINDEX(@nombre, t.familia) > 0 OR CHARINDEX(@nombre, t.genero)  > 0 OR
                        CHARINDEX(@nombre, t.especie) > 0
                    ))
                )
            )
        )
        AND (@categoria_id IS NULL OR f.categoria_id = @categoria_id)
        AND (@era_id       IS NULL OR f.era_id       = @era_id)
        AND (@periodo_id   IS NULL OR f.periodo_id   = @periodo_id)
        AND (@canton_id    IS NULL OR f.canton_id    = @canton_id)
    ORDER BY f.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @por_pagina ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE sp_agregar_multimedia
    @usuario_id     INT,
    @fosil_id       INT,
    @tipo           VARCHAR(10),
    @subtipo        VARCHAR(20),
    @url            VARCHAR(500),
    @nombre_archivo VARCHAR(255) = NULL,
    @es_principal   BIT          = 0,
    @orden          INT          = 0,
    @descripcion    VARCHAR(500) = NULL,
    @nuevo_id       INT          OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM FOSIL WHERE id = @fosil_id AND deleted_at IS NULL)
        THROW 50030, 'Fosil no encontrado o eliminado.', 1;

    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, es_principal, orden, descripcion)
    VALUES (@fosil_id, @tipo, @subtipo, @url, COALESCE(@nombre_archivo, N'archivo'), @es_principal, @orden, @descripcion);

    SET @nuevo_id = SCOPE_IDENTITY();

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
    VALUES (
        @usuario_id, 'MULTIMEDIA', @nuevo_id, 'INSERT',
        (SELECT @fosil_id AS fosil_id, @tipo AS tipo, @subtipo AS subtipo, @url AS url
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_actualizar_multimedia
    @multimedia_id  INT,
    @usuario_id     INT,
    @tipo           VARCHAR(10)  = NULL,
    @subtipo        VARCHAR(20)  = NULL,
    @url            VARCHAR(500) = NULL,
    @nombre_archivo VARCHAR(255) = NULL,
    @es_principal   BIT          = NULL,
    @orden          INT          = NULL,
    @descripcion    VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ant NVARCHAR(MAX);

    SELECT @ant = (
        SELECT id, fosil_id, tipo, subtipo, url, nombre_archivo, es_principal, orden
        FROM MULTIMEDIA
        WHERE id = @multimedia_id AND deleted_at IS NULL
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    );

    IF @ant IS NULL
        THROW 50031, 'Multimedia no encontrada o eliminada.', 1;

    UPDATE MULTIMEDIA SET
        tipo           = ISNULL(@tipo,           tipo),
        subtipo        = ISNULL(@subtipo,        subtipo),
        url            = ISNULL(@url,            url),
        nombre_archivo = ISNULL(@nombre_archivo, nombre_archivo),
        es_principal   = ISNULL(@es_principal,   es_principal),
        orden          = ISNULL(@orden,          orden),
        descripcion    = ISNULL(@descripcion,    descripcion)
    WHERE id = @multimedia_id AND deleted_at IS NULL;

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos)
    VALUES (
        @usuario_id, 'MULTIMEDIA', @multimedia_id, 'UPDATE',
        @ant,
        (SELECT id, fosil_id, tipo, subtipo, url, nombre_archivo, es_principal, orden
         FROM MULTIMEDIA WHERE id = @multimedia_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_eliminar_multimedia
    @multimedia_id INT,
    @usuario_id    INT,
    @motivo        VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE id = @multimedia_id AND deleted_at IS NULL)
        THROW 50032, 'Multimedia no encontrada o ya eliminada.', 1;

    UPDATE MULTIMEDIA SET deleted_at = GETDATE() WHERE id = @multimedia_id;

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
    VALUES (
        @usuario_id, 'MULTIMEDIA', @multimedia_id, 'SOFT_DELETE',
        (SELECT ISNULL(@motivo, N'Eliminacion logica') AS motivo FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_registrar_estudio
    @usuario_id             INT,
    @fosil_id               INT,
    @investigador_id        INT,
    @titulo                 VARCHAR(300),
    @contexto_objetivo      VARCHAR(MAX),
    @tipo_analisis          VARCHAR(200),
    @resultados             VARCHAR(MAX),
    @composicion            VARCHAR(MAX) = NULL,
    @condiciones_hallazgo   VARCHAR(MAX) = NULL,
    @informacion_adicional  VARCHAR(MAX) = NULL,
    @documentacion_contacto VARCHAR(500) = NULL,
    @publicado              BIT          = 0,
    @nuevo_id               INT          OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM FOSIL   WHERE id = @fosil_id        AND deleted_at IS NULL)
        THROW 50040, 'Fosil no encontrado o eliminado.', 1;
    IF NOT EXISTS (SELECT 1 FROM USUARIO WHERE id = @investigador_id AND deleted_at IS NULL)
        THROW 50041, 'Investigador no valido.', 1;

    INSERT INTO ESTUDIO_CIENTIFICO (
        fosil_id, investigador_id, titulo, contexto_objetivo, tipo_analisis, resultados,
        composicion, condiciones_hallazgo, informacion_adicional, documentacion_contacto, publicado
    ) VALUES (
        @fosil_id, @investigador_id, @titulo, @contexto_objetivo, @tipo_analisis, @resultados,
        @composicion, @condiciones_hallazgo, @informacion_adicional, @documentacion_contacto, @publicado
    );

    SET @nuevo_id = SCOPE_IDENTITY();

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
    VALUES (
        @usuario_id, 'ESTUDIO_CIENTIFICO', @nuevo_id, 'INSERT',
        (SELECT @fosil_id AS fosil_id, @titulo AS titulo FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_actualizar_estudio
    @estudio_id             INT,
    @usuario_id             INT,
    @titulo                 VARCHAR(300) = NULL,
    @contexto_objetivo      VARCHAR(MAX) = NULL,
    @tipo_analisis          VARCHAR(200) = NULL,
    @resultados             VARCHAR(MAX) = NULL,
    @composicion            VARCHAR(MAX) = NULL,
    @condiciones_hallazgo   VARCHAR(MAX) = NULL,
    @informacion_adicional  VARCHAR(MAX) = NULL,
    @documentacion_contacto VARCHAR(500) = NULL,
    @publicado              BIT          = NULL,
    @investigador_id        INT          = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ant NVARCHAR(MAX);

    SELECT @ant = (
        SELECT id, fosil_id, investigador_id, titulo, publicado
        FROM ESTUDIO_CIENTIFICO
        WHERE id = @estudio_id AND deleted_at IS NULL
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    );

    IF @ant IS NULL
        THROW 50042, 'Estudio no encontrado o eliminado.', 1;

    IF @investigador_id IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM USUARIO WHERE id = @investigador_id AND deleted_at IS NULL)
        THROW 50043, 'Investigador no valido.', 1;

    UPDATE ESTUDIO_CIENTIFICO SET
        titulo                  = ISNULL(@titulo,                 titulo),
        contexto_objetivo       = ISNULL(@contexto_objetivo,      contexto_objetivo),
        tipo_analisis           = ISNULL(@tipo_analisis,          tipo_analisis),
        resultados              = ISNULL(@resultados,             resultados),
        composicion             = ISNULL(@composicion,            composicion),
        condiciones_hallazgo    = ISNULL(@condiciones_hallazgo,   condiciones_hallazgo),
        informacion_adicional   = ISNULL(@informacion_adicional,  informacion_adicional),
        documentacion_contacto  = ISNULL(@documentacion_contacto, documentacion_contacto),
        publicado               = ISNULL(@publicado,              publicado),
        investigador_id         = ISNULL(@investigador_id,        investigador_id),
        updated_at              = GETDATE()
    WHERE id = @estudio_id AND deleted_at IS NULL;

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos)
    VALUES (
        @usuario_id, 'ESTUDIO_CIENTIFICO', @estudio_id, 'UPDATE',
        @ant,
        (SELECT id, fosil_id, investigador_id, titulo, publicado
         FROM ESTUDIO_CIENTIFICO WHERE id = @estudio_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_eliminar_estudio
    @estudio_id INT,
    @usuario_id INT,
    @motivo     VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM ESTUDIO_CIENTIFICO WHERE id = @estudio_id AND deleted_at IS NULL)
        THROW 50044, 'Estudio no encontrado o ya eliminado.', 1;

    UPDATE ESTUDIO_CIENTIFICO SET deleted_at = GETDATE(), updated_at = GETDATE() WHERE id = @estudio_id;

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
    VALUES (
        @usuario_id, 'ESTUDIO_CIENTIFICO', @estudio_id, 'SOFT_DELETE',
        (SELECT ISNULL(@motivo, N'Eliminacion logica') AS motivo FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_agregar_referencia_estudio
    @usuario_id INT,
    @estudio_id INT,
    @titulo     VARCHAR(300),
    @url        VARCHAR(500),
    @tipo       VARCHAR(50)  = N'enlace',
    @autores    VARCHAR(500) = NULL,
    @anio       INT          = NULL,
    @nuevo_id   INT          OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM ESTUDIO_CIENTIFICO WHERE id = @estudio_id AND deleted_at IS NULL)
        THROW 50050, 'Estudio no encontrado o eliminado.', 1;

    INSERT INTO REFERENCIA_ESTUDIO (estudio_id, titulo, url, tipo, autores, anio)
    VALUES (@estudio_id, @titulo, @url, @tipo, @autores, @anio);

    SET @nuevo_id = SCOPE_IDENTITY();

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
    VALUES (
        @usuario_id, 'REFERENCIA_ESTUDIO', @nuevo_id, 'INSERT',
        (SELECT @estudio_id AS estudio_id, @titulo AS titulo FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_eliminar_referencia_estudio
    @referencia_id INT,
    @usuario_id    INT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM REFERENCIA_ESTUDIO WHERE id = @referencia_id)
        THROW 50051, 'Referencia no encontrada.', 1;

    DECLARE @estudio_id INT;
    SELECT @estudio_id = estudio_id FROM REFERENCIA_ESTUDIO WHERE id = @referencia_id;

    DELETE FROM REFERENCIA_ESTUDIO WHERE id = @referencia_id;

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
    VALUES (
        @usuario_id, 'REFERENCIA_ESTUDIO', @referencia_id, 'DELETE',
        (SELECT @estudio_id AS estudio_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    );
END
GO

CREATE OR ALTER PROCEDURE sp_asignar_rol
    @usuario_id INT,
    @rol_nombre VARCHAR(50),
    @admin_id   INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM USUARIO WHERE id = @usuario_id AND deleted_at IS NULL)
            THROW 50060, 'Usuario no encontrado o eliminado.', 1;

        IF NOT EXISTS (SELECT 1 FROM ROL WHERE nombre = @rol_nombre)
            THROW 50061, 'Rol no valido.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM USUARIO u INNER JOIN ROL r ON u.rol_id = r.id
            WHERE u.id = @admin_id AND r.nombre = 'administrador' AND u.deleted_at IS NULL
        )
            THROW 50062, 'Solo administradores pueden asignar roles.', 1;

        DECLARE @rol_id INT;
        SELECT @rol_id = id FROM ROL WHERE nombre = @rol_nombre;

        IF EXISTS (SELECT 1 FROM USUARIO_ROL WHERE usuario_id = @usuario_id AND rol_id = @rol_id)
            UPDATE USUARIO_ROL SET activo = 1
            WHERE usuario_id = @usuario_id AND rol_id = @rol_id;
        ELSE
            INSERT INTO USUARIO_ROL (usuario_id, rol_id) VALUES (@usuario_id, @rol_id);

        INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
        VALUES (
            @admin_id, 'USUARIO_ROL', @usuario_id, 'INSERT',
            (SELECT @rol_nombre AS rol_asignado, @usuario_id AS usuario_id
             FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_quitar_rol
    @usuario_id INT,
    @rol_nombre VARCHAR(50),
    @admin_id   INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM USUARIO WHERE id = @usuario_id AND deleted_at IS NULL)
            THROW 50063, 'Usuario no encontrado o eliminado.', 1;

        IF NOT EXISTS (
            SELECT 1 FROM USUARIO u INNER JOIN ROL r ON u.rol_id = r.id
            WHERE u.id = @admin_id AND r.nombre = 'administrador' AND u.deleted_at IS NULL
        )
            THROW 50064, 'Solo administradores pueden quitar roles.', 1;

        DECLARE @rol_id INT;
        SELECT @rol_id = id FROM ROL WHERE nombre = @rol_nombre;

        IF @rol_id IS NULL
            THROW 50065, 'Rol no valido.', 1;

        IF (SELECT COUNT(*) FROM USUARIO_ROL WHERE usuario_id = @usuario_id AND activo = 1) <= 1
            THROW 50066, 'El usuario debe tener al menos un rol activo.', 1;

        UPDATE USUARIO_ROL SET activo = 0
        WHERE usuario_id = @usuario_id AND rol_id = @rol_id;

        INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_nuevos)
        VALUES (
            @admin_id, 'USUARIO_ROL', @usuario_id, 'UPDATE',
            (SELECT @rol_nombre AS rol_removido, @usuario_id AS usuario_id
             FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_obtener_roles_usuario
    @usuario_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        r.id,
        r.nombre,
        r.descripcion,
        ur.activo,
        ur.created_at AS asignado_en
    FROM USUARIO_ROL ur
    INNER JOIN ROL r ON ur.rol_id = r.id
    WHERE ur.usuario_id = @usuario_id
    ORDER BY r.nombre;
END
GO

CREATE OR ALTER FUNCTION fn_usuario_tiene_rol (
    @usuario_id INT,
    @rol_nombre VARCHAR(50)
)
RETURNS BIT
AS
BEGIN
    DECLARE @resultado BIT = 0;
    IF EXISTS (
        SELECT 1
        FROM USUARIO_ROL ur
        INNER JOIN ROL r ON ur.rol_id = r.id
        WHERE ur.usuario_id = @usuario_id
          AND r.nombre      = @rol_nombre
          AND ur.activo     = 1
    )
        SET @resultado = 1;
    RETURN @resultado;
END
GO

-- Full-Text: catalogo e indices en 00_fulltext_setup.sql (ejecutar despues de 02_tablas_principales.sql).
