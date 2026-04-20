USE FosilesDB;
GO

-- Ejecutar SOLO si ya tenias usuarios con un hash viejo y no puedes volver a cargar 04_datos_prueba.sql completo.
-- Contrasena resultante para todos los usuarios afectados: Admin123!
-- Mismo hash que en 04_datos_prueba.sql (variable @h).

UPDATE USUARIO
SET password_hash = '$2b$10$mbvLZgIYs7TEplb7n2vc8.04mWshzDpSfQaRt1KO3TNJXOF8mvgQO',
    updated_at = GETDATE()
WHERE deleted_at IS NULL;
GO
