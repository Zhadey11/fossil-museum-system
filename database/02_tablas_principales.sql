USE FosilesDB;
GO

CREATE TABLE USUARIO (
    id             INT          NOT NULL IDENTITY(1,1),
    rol_id         INT          NOT NULL,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    email          VARCHAR(255) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    telefono       VARCHAR(20)  NULL,
    pais           VARCHAR(100) NULL,
    profesion      VARCHAR(150) NULL,
    centro_trabajo VARCHAR(255) NULL,
    activo         BIT          NOT NULL DEFAULT 1,
    created_at     DATETIME2    NOT NULL DEFAULT GETDATE(),
    updated_at     DATETIME2    NOT NULL DEFAULT GETDATE(),
    deleted_at     DATETIME2    NULL,
    CONSTRAINT PK_USUARIO       PRIMARY KEY (id),
    CONSTRAINT UQ_USUARIO_email UNIQUE (email),
    CONSTRAINT FK_USUARIO_ROL   FOREIGN KEY (rol_id) REFERENCES ROL(id),
    CONSTRAINT CK_USUARIO_email CHECK (email LIKE '%@%.%')
);
GO

CREATE TABLE FOSIL (
    id                       INT           NOT NULL IDENTITY(1,1),
    codigo_unico             VARCHAR(30)   NOT NULL,
    canton_id                INT           NOT NULL,
    categoria_id             INT           NOT NULL,
    era_id                   INT           NOT NULL,
    periodo_id               INT           NOT NULL,
    taxonomia_id             INT           NULL,
    explorador_id            INT           NOT NULL,
    administrador_id         INT           NULL,
    nombre                   VARCHAR(255)  NOT NULL,
    slug                     VARCHAR(300)  NOT NULL,
    descripcion_general      VARCHAR(MAX)  NOT NULL,
    descripcion_detallada    VARCHAR(MAX)  NULL,
    descripcion_estado_orig  VARCHAR(MAX)  NULL,
    contexto_geologico       VARCHAR(MAX)  NULL,
    latitud                  DECIMAL(10,7) NULL,
    longitud                 DECIMAL(10,7) NULL,
    altitud_msnm             DECIMAL(8,2)  NULL,
    descripcion_ubicacion    VARCHAR(500)  NULL,
    estado                   VARCHAR(20)   NOT NULL DEFAULT 'pendiente',
    fecha_hallazgo           DATE          NULL,
    fecha_aprobacion         DATETIME2     NULL,
    notas_revision           VARCHAR(MAX)  NULL,
    created_at               DATETIME2     NOT NULL DEFAULT GETDATE(),
    updated_at               DATETIME2     NOT NULL DEFAULT GETDATE(),
    deleted_at               DATETIME2     NULL,
    CONSTRAINT PK_FOSIL          PRIMARY KEY (id),
    CONSTRAINT UQ_FOSIL_codigo   UNIQUE (codigo_unico),
    CONSTRAINT UQ_FOSIL_slug     UNIQUE (slug),
    CONSTRAINT FK_FOSIL_CANTON   FOREIGN KEY (canton_id)        REFERENCES CANTON(id),
    CONSTRAINT FK_FOSIL_CAT      FOREIGN KEY (categoria_id)     REFERENCES CATEGORIA_FOSIL(id),
    CONSTRAINT FK_FOSIL_ERA      FOREIGN KEY (era_id)           REFERENCES ERA_GEOLOGICA(id),
    CONSTRAINT FK_FOSIL_PERIODO  FOREIGN KEY (periodo_id)       REFERENCES PERIODO_GEOLOGICO(id),
    CONSTRAINT FK_FOSIL_TAX      FOREIGN KEY (taxonomia_id)     REFERENCES TAXONOMIA(id),
    CONSTRAINT FK_FOSIL_EXPLOR   FOREIGN KEY (explorador_id)    REFERENCES USUARIO(id),
    CONSTRAINT FK_FOSIL_ADMIN    FOREIGN KEY (administrador_id) REFERENCES USUARIO(id),
    CONSTRAINT CK_FOSIL_estado   CHECK (estado IN ('pendiente','publicado','rechazado','en_revision')),
    CONSTRAINT CK_FOSIL_coords   CHECK (
        (latitud IS NULL AND longitud IS NULL)
        OR (latitud BETWEEN -90 AND 90 AND longitud BETWEEN -180 AND 180)
    )
);
GO

CREATE TRIGGER TRG_FOSIL_validar_era_periodo
ON FOSIL
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN PERIODO_GEOLOGICO p ON p.id = i.periodo_id
        WHERE p.era_id <> i.era_id
    )
    BEGIN
        THROW 50010, 'El periodo geologico no pertenece a la era indicada.', 1;
    END
END;
GO

CREATE TABLE MULTIMEDIA (
    id             INT          NOT NULL IDENTITY(1,1),
    fosil_id       INT          NOT NULL,
    tipo           VARCHAR(20)  NOT NULL,
    subtipo        VARCHAR(20)  NOT NULL,
    url            VARCHAR(500) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    formato        VARCHAR(10)  NULL,
    angulo         VARCHAR(100) NULL,
    descripcion    VARCHAR(500) NULL,
    tamano_bytes   BIGINT       NULL,
    ancho_px       INT          NULL,
    alto_px        INT          NULL,
    es_principal   BIT          NOT NULL DEFAULT 0,
    orden          INT          NOT NULL DEFAULT 0,
    created_at     DATETIME2    NOT NULL DEFAULT GETDATE(),
    deleted_at     DATETIME2    NULL,
    CONSTRAINT PK_MULTIMEDIA    PRIMARY KEY (id),
    CONSTRAINT FK_MULTI_FOSIL   FOREIGN KEY (fosil_id) REFERENCES FOSIL(id),
    CONSTRAINT CK_MULTI_tipo    CHECK (tipo    IN ('imagen','video','modelo3d','audio','documento')),
    CONSTRAINT CK_MULTI_subtipo CHECK (subtipo IN ('antes','despues','analisis','general','portada','reconstruccion','escaneo'))
);
GO

CREATE TABLE ESTUDIO_CIENTIFICO (
    id                     INT          NOT NULL IDENTITY(1,1),
    fosil_id               INT          NOT NULL,
    investigador_id        INT          NOT NULL,
    titulo                 VARCHAR(300) NOT NULL,
    contexto_objetivo      TEXT         NOT NULL,
    tipo_analisis          VARCHAR(200) NOT NULL,
    resultados             TEXT         NOT NULL,
    composicion            TEXT         NULL,
    condiciones_hallazgo   TEXT         NULL,
    informacion_adicional  TEXT         NULL,
    documentacion_contacto VARCHAR(500) NULL,
    publicado              BIT          NOT NULL DEFAULT 0,
    created_at             DATETIME2    NOT NULL DEFAULT GETDATE(),
    updated_at             DATETIME2    NOT NULL DEFAULT GETDATE(),
    deleted_at             DATETIME2    NULL,
    CONSTRAINT PK_ESTUDIO       PRIMARY KEY (id),
    CONSTRAINT FK_ESTUDIO_FOSIL FOREIGN KEY (fosil_id)        REFERENCES FOSIL(id),
    CONSTRAINT FK_ESTUDIO_INV   FOREIGN KEY (investigador_id) REFERENCES USUARIO(id)
);
GO

CREATE TABLE REFERENCIA_ESTUDIO (
    id         INT          NOT NULL IDENTITY(1,1),
    estudio_id INT          NOT NULL,
    titulo     VARCHAR(300) NOT NULL,
    url        VARCHAR(500) NOT NULL,
    tipo       VARCHAR(50)  NOT NULL DEFAULT 'enlace',
    autores    VARCHAR(500) NULL,
    anio       INT          NULL,
    created_at DATETIME2    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_REFERENCIA  PRIMARY KEY (id),
    CONSTRAINT FK_REF_ESTUDIO FOREIGN KEY (estudio_id) REFERENCES ESTUDIO_CIENTIFICO(id) ON DELETE CASCADE,
    CONSTRAINT CK_REF_tipo    CHECK (tipo IN ('enlace','articulo','libro','tesis','informe','doi'))
);
GO

CREATE TABLE CONTACTO (
    id         INT          NOT NULL IDENTITY(1,1),
    nombre     VARCHAR(200) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    asunto     VARCHAR(300) NOT NULL,
    mensaje    TEXT         NOT NULL,
    leido      BIT          NOT NULL DEFAULT 0,
    respondido BIT          NOT NULL DEFAULT 0,
    ip_origen  VARCHAR(45)  NULL,
    created_at DATETIME2    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_CONTACTO       PRIMARY KEY (id),
    CONSTRAINT CK_CONTACTO_email CHECK (email LIKE '%@%.%')
);
GO

CREATE TABLE LOG_AUDITORIA (
    id               INT           NOT NULL IDENTITY(1,1),
    usuario_id       INT           NULL,
    tabla_afectada   VARCHAR(100)  NOT NULL,
    registro_id      INT           NOT NULL,
    accion           VARCHAR(20)   NOT NULL,
    datos_anteriores NVARCHAR(MAX) NULL,
    datos_nuevos     NVARCHAR(MAX) NULL,
    ip_address       VARCHAR(45)   NULL,
    user_agent       VARCHAR(500)  NULL,
    created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_LOG        PRIMARY KEY (id),
    CONSTRAINT FK_LOG_USR    FOREIGN KEY (usuario_id) REFERENCES USUARIO(id),
    CONSTRAINT CK_LOG_accion CHECK (accion IN (
        'INSERT','UPDATE','DELETE','SOFT_DELETE','RESTORE','LOGIN','LOGOUT','UPDATE_FOSIL'
    ))
);
GO

CREATE TRIGGER TRG_FOSIL_auditoria_UPDATE
ON FOSIL
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF CAST(SESSION_CONTEXT(N'skip_fosil_update_audit') AS NVARCHAR(10)) = N'1'
        RETURN;

    INSERT INTO LOG_AUDITORIA (usuario_id, tabla_afectada, registro_id, accion, datos_anteriores, datos_nuevos)
    SELECT
        TRY_CAST(SESSION_CONTEXT(N'audit_user_id') AS INT),
        'FOSIL',
        i.id,
        'UPDATE_FOSIL',
        (
            SELECT
                d.id, d.codigo_unico, d.canton_id, d.categoria_id, d.era_id, d.periodo_id,
                d.taxonomia_id, d.nombre, d.slug, d.estado, d.latitud, d.longitud, d.altitud_msnm,
                d.descripcion_general, d.descripcion_detallada
            FROM deleted d
            WHERE d.id = i.id
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ),
        (
            SELECT
                i2.id, i2.codigo_unico, i2.canton_id, i2.categoria_id, i2.era_id, i2.periodo_id,
                i2.taxonomia_id, i2.nombre, i2.slug, i2.estado, i2.latitud, i2.longitud, i2.altitud_msnm,
                i2.descripcion_general, i2.descripcion_detallada
            FROM inserted i2
            WHERE i2.id = i.id
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        )
    FROM inserted i
    INNER JOIN deleted del ON del.id = i.id;
END;
GO

CREATE TABLE USUARIO_ROL (
    id         INT       NOT NULL IDENTITY(1,1),
    usuario_id INT       NOT NULL,
    rol_id     INT       NOT NULL,
    activo     BIT       NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_USUARIO_ROL  PRIMARY KEY (id),
    CONSTRAINT UQ_USUARIO_ROL  UNIQUE (usuario_id, rol_id),
    CONSTRAINT FK_USUROL_USR   FOREIGN KEY (usuario_id) REFERENCES USUARIO(id),
    CONSTRAINT FK_USUROL_ROL   FOREIGN KEY (rol_id)     REFERENCES ROL(id)
);
GO
