/* Papelera para mensajes de CONTACTO (borrado lógico). */
IF COL_LENGTH('CONTACTO', 'deleted_at') IS NULL
BEGIN
  ALTER TABLE CONTACTO
  ADD deleted_at DATETIME2 NULL;
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID('CONTACTO')
    AND name = 'IX_CONTACTO_deleted_at'
)
BEGIN
  CREATE INDEX IX_CONTACTO_deleted_at
    ON CONTACTO (deleted_at, created_at DESC);
END
GO
