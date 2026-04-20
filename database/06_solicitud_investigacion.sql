USE FosilesDB;
GO

/*
  Solicitudes de acceso a datos científicos por investigador.
  Ejecutar después de 04_datos_prueba.sql.

  Flujo: el investigador elige IDs del catálogo público y envía solicitud
  (queda registro en CONTACTO para el administrador y trazabilidad).
  Al aprobar, se registran filas en INVESTIGADOR_FOSIL_AUTORIZADO.
*/

IF OBJECT_ID('dbo.SOLICITUD_INVESTIGACION', 'U') IS NULL
BEGIN
    CREATE TABLE SOLICITUD_INVESTIGACION (
        id               INT           NOT NULL IDENTITY(1,1),
        investigador_id  INT           NOT NULL,
        asunto           VARCHAR(300)  NOT NULL,
        mensaje          VARCHAR(MAX)  NOT NULL,
        estado           VARCHAR(20)   NOT NULL DEFAULT 'pendiente',
        revisado_por     INT           NULL,
        revisado_at      DATETIME2     NULL,
        nota_admin       VARCHAR(MAX)  NULL,
        created_at       DATETIME2     NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_SOLICITUD_INVESTIGACION PRIMARY KEY (id),
        CONSTRAINT FK_SOL_INV_INVEST FOREIGN KEY (investigador_id) REFERENCES USUARIO(id),
        CONSTRAINT FK_SOL_INV_ADMIN  FOREIGN KEY (revisado_por) REFERENCES USUARIO(id),
        CONSTRAINT CK_SOL_INV_ESTADO   CHECK (estado IN ('pendiente','aprobado','rechazado'))
    );
END;
GO

IF OBJECT_ID('dbo.SOLICITUD_INV_FOSIL', 'U') IS NULL
BEGIN
    CREATE TABLE SOLICITUD_INV_FOSIL (
        solicitud_id INT NOT NULL,
        fosil_id     INT NOT NULL,
        CONSTRAINT PK_SOLICITUD_INV_FOSIL PRIMARY KEY (solicitud_id, fosil_id),
        CONSTRAINT FK_SIF_SOL FOREIGN KEY (solicitud_id) REFERENCES SOLICITUD_INVESTIGACION(id) ON DELETE CASCADE,
        CONSTRAINT FK_SIF_FOS FOREIGN KEY (fosil_id)     REFERENCES FOSIL(id)
    );
END;
GO

IF OBJECT_ID('dbo.INVESTIGADOR_FOSIL_AUTORIZADO', 'U') IS NULL
BEGIN
    CREATE TABLE INVESTIGADOR_FOSIL_AUTORIZADO (
        investigador_id INT          NOT NULL,
        fosil_id        INT          NOT NULL,
        solicitud_id    INT          NULL,
        created_at      DATETIME2    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_INV_FOS_AUT PRIMARY KEY (investigador_id, fosil_id),
        CONSTRAINT FK_IFA_USR FOREIGN KEY (investigador_id) REFERENCES USUARIO(id),
        CONSTRAINT FK_IFA_FOS FOREIGN KEY (fosil_id)        REFERENCES FOSIL(id),
        CONSTRAINT FK_IFA_SOL FOREIGN KEY (solicitud_id)    REFERENCES SOLICITUD_INVESTIGACION(id) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_SOL_INV_INVEST_ESTADO' AND object_id = OBJECT_ID('dbo.SOLICITUD_INVESTIGACION'))
    CREATE NONCLUSTERED INDEX IX_SOL_INV_INVEST_ESTADO
        ON SOLICITUD_INVESTIGACION (investigador_id, estado) INCLUDE (created_at, asunto);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_IFA_FOSIL' AND object_id = OBJECT_ID('dbo.INVESTIGADOR_FOSIL_AUTORIZADO'))
    CREATE NONCLUSTERED INDEX IX_IFA_FOSIL
        ON INVESTIGADOR_FOSIL_AUTORIZADO (fosil_id) INCLUDE (investigador_id);
GO

/* Demo: accesos iniciales para investigadores de prueba (sin solicitud previa). */
INSERT INTO INVESTIGADOR_FOSIL_AUTORIZADO (investigador_id, fosil_id, solicitud_id)
SELECT u.id, f.id, NULL
FROM USUARIO u
CROSS JOIN (
    SELECT id FROM FOSIL WHERE deleted_at IS NULL AND estado = 'publicado' AND id <= 5
) f
WHERE u.email = 'jalvarado@ucr.ac.cr'
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM INVESTIGADOR_FOSIL_AUTORIZADO x
      WHERE x.investigador_id = u.id AND x.fosil_id = f.id
  );
GO
