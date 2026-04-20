USE master;
GO

-- MDF/LDF en ruta por defecto de la instancia (para otra carpeta: CREATE DATABASE ... ON (FILENAME=...))
CREATE DATABASE FosilesDB;
GO

USE FosilesDB;
GO

-- Concurrencia y recuperacion (ajuste segun politica de backups)
ALTER DATABASE FosilesDB SET RECOVERY FULL;
ALTER DATABASE FosilesDB SET READ_COMMITTED_SNAPSHOT ON;
ALTER DATABASE FosilesDB SET ALLOW_SNAPSHOT_ISOLATION ON;
GO

-- Roles de aplicacion (login y permisos se resuelven en backend)
CREATE TABLE ROL (
    id          INT          NOT NULL IDENTITY(1,1),
    nombre      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    activo      BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_ROL        PRIMARY KEY (id),
    CONSTRAINT UQ_ROL_nombre UNIQUE (nombre),
    CONSTRAINT CK_ROL_nombre CHECK (nombre IN ('administrador','investigador','explorador','publico'))
);
GO

-- Ubicacion: pais -> provincia -> canton (FK en 02)
CREATE TABLE PAIS (
    id         INT      NOT NULL IDENTITY(1,1),
    codigo_iso CHAR(3)  NOT NULL,
    nombre     VARCHAR(100) NOT NULL,
    activo     BIT      NOT NULL DEFAULT 1,
    CONSTRAINT PK_PAIS        PRIMARY KEY (id),
    CONSTRAINT UQ_PAIS_codigo UNIQUE (codigo_iso)
);
GO

CREATE TABLE PROVINCIA (
    id      INT         NOT NULL IDENTITY(1,1),
    pais_id INT         NOT NULL,
    codigo  VARCHAR(5)  NOT NULL,
    nombre  VARCHAR(100) NOT NULL,
    activo  BIT         NOT NULL DEFAULT 1,
    CONSTRAINT PK_PROVINCIA        PRIMARY KEY (id),
    CONSTRAINT UQ_PROVINCIA_pais_codigo UNIQUE (pais_id, codigo),
    CONSTRAINT CK_PROVINCIA_codigo      CHECK (codigo LIKE '[A-Z][A-Z][A-Z]'),
    CONSTRAINT FK_PROVINCIA_PAIS   FOREIGN KEY (pais_id) REFERENCES PAIS(id)
);
GO

CREATE TABLE CANTON (
    id           INT         NOT NULL IDENTITY(1,1),
    provincia_id INT         NOT NULL,
    codigo       VARCHAR(5)  NOT NULL,
    nombre       VARCHAR(100) NOT NULL,
    activo       BIT         NOT NULL DEFAULT 1,
    CONSTRAINT PK_CANTON        PRIMARY KEY (id),
    CONSTRAINT UQ_CANTON_prov_codigo UNIQUE (provincia_id, codigo),
    CONSTRAINT CK_CANTON_codigo      CHECK (codigo LIKE '[A-Z][A-Z][A-Z]'),
    CONSTRAINT FK_CANTON_PROV   FOREIGN KEY (provincia_id) REFERENCES PROVINCIA(id)
);
GO

-- Tipo de hallazgo (fosil, mineral, roca, paleontologico)
CREATE TABLE CATEGORIA_FOSIL (
    id          INT         NOT NULL IDENTITY(1,1),
    codigo      CHAR(3)     NOT NULL,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    activo      BIT         NOT NULL DEFAULT 1,
    CONSTRAINT PK_CATEGORIA        PRIMARY KEY (id),
    CONSTRAINT UQ_CATEGORIA_codigo UNIQUE (codigo),
    CONSTRAINT CK_CATEGORIA_codigo CHECK (codigo IN ('FOS','MIN','ROC','PAL'))
);
GO

-- Tiempo geologico: Ma = millones de anos (inicio > fin)
CREATE TABLE ERA_GEOLOGICA (
    id         INT  NOT NULL IDENTITY(1,1),
    nombre     VARCHAR(100) NOT NULL,
    descripcion TEXT         NOT NULL,
    ma_inicio  INT  NOT NULL,
    ma_fin     INT  NOT NULL,
    activo     BIT  NOT NULL DEFAULT 1,
    CONSTRAINT PK_ERA       PRIMARY KEY (id),
    CONSTRAINT UQ_ERA_nombre UNIQUE (nombre),
    CONSTRAINT CK_ERA_rango  CHECK (ma_inicio > ma_fin)
);
GO

-- Periodo ligado a era (FK); validacion con ficha en TRG_FOSIL_validar_era_periodo (02)
CREATE TABLE PERIODO_GEOLOGICO (
    id         INT  NOT NULL IDENTITY(1,1),
    era_id     INT  NOT NULL,
    nombre     VARCHAR(100) NOT NULL,
    descripcion TEXT         NOT NULL,
    ma_inicio  INT  NOT NULL,
    ma_fin     INT  NOT NULL,
    activo     BIT  NOT NULL DEFAULT 1,
    CONSTRAINT PK_PERIODO        PRIMARY KEY (id),
    CONSTRAINT UQ_PERIODO_nombre UNIQUE (nombre),
    CONSTRAINT FK_PERIODO_ERA    FOREIGN KEY (era_id) REFERENCES ERA_GEOLOGICA(id),
    CONSTRAINT CK_PERIODO_rango  CHECK (ma_inicio > ma_fin)
);
GO

-- Nombre cientifico (reino a especie); opcional en FOSIL.taxonomia_id
CREATE TABLE TAXONOMIA (
    id         INT          NOT NULL IDENTITY(1,1),
    reino      VARCHAR(100) NOT NULL,
    filo       VARCHAR(100) NOT NULL,
    clase      VARCHAR(100) NOT NULL,
    orden      VARCHAR(100) NOT NULL,
    familia    VARCHAR(100) NOT NULL,
    genero     VARCHAR(100) NOT NULL,
    especie    VARCHAR(200) NOT NULL,
    created_at DATETIME2    NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_TAXONOMIA          PRIMARY KEY (id),
    CONSTRAINT UQ_TAXONOMIA_completa UNIQUE (reino,filo,clase,orden,familia,genero,especie),
    CONSTRAINT CK_TAXONOMIA_genero_no_vacio CHECK (LEN(LTRIM(RTRIM(genero))) > 0),
    CONSTRAINT CK_TAXONOMIA_especie_no_vacia CHECK (LEN(LTRIM(RTRIM(especie))) > 0)
);
GO
