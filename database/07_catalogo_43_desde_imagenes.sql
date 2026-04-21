USE FosilesDB;
GO

/*
  Carga de fosiles desde inventario de imagenes unicas (sin duplicados).
  Supuestos aprobados:
    - Canton fijo: San Jose Centro (Costa Rica)
    - Coordenadas fijas: 9.7489, -83.7534
    - Era/Periodo por defecto: Mesozoico / Cretacico
    - Estado final: publicado
    - Multimedia: tipo=imagen, subtipo=portada, es_principal=1, orden=0

  Requiere seed base:
    - Usuario explorador: explorador@stonewake.org
    - Usuario admin: admin@stonewake.org
*/

SET NOCOUNT ON;

BEGIN TRY
  BEGIN TRANSACTION;

  DECLARE @explorador_id INT = (
    SELECT TOP 1 id
    FROM USUARIO
    WHERE email = 'explorador@stonewake.org'
      AND deleted_at IS NULL
  );

  DECLARE @admin_id INT = (
    SELECT TOP 1 id
    FROM USUARIO
    WHERE email = 'admin@stonewake.org'
      AND deleted_at IS NULL
  );

  DECLARE @miguel_id INT = (
    SELECT TOP 1 id
    FROM USUARIO
    WHERE email = 'miguel@stonewake.org'
      AND deleted_at IS NULL
  );

  DECLARE @canton_id INT = (
    SELECT TOP 1 c.id
    FROM CANTON c
    INNER JOIN PROVINCIA p ON p.id = c.provincia_id
    INNER JOIN PAIS pa ON pa.id = p.pais_id
    WHERE c.nombre = 'San Jose Centro'
      AND pa.codigo_iso = 'CRI'
  );

  DECLARE @era_id INT = (
    SELECT TOP 1 id
    FROM ERA_GEOLOGICA
    WHERE nombre = 'Mesozoico'
  );

  DECLARE @periodo_id INT = (
    SELECT TOP 1 id
    FROM PERIODO_GEOLOGICO
    WHERE nombre = 'Cretacico'
      AND era_id = @era_id
  );

  IF @explorador_id IS NULL THROW 50001, 'No existe explorador@stonewake.org.', 1;
  IF @admin_id IS NULL THROW 50002, 'No existe admin@stonewake.org.', 1;
  IF @miguel_id IS NULL THROW 50003, 'No existe miguel@stonewake.org.', 1;
  IF @canton_id IS NULL THROW 50004, 'No existe canton San Jose Centro (CRI).', 1;
  IF @era_id IS NULL THROW 50005, 'No existe era Mesozoico.', 1;
  IF @periodo_id IS NULL THROW 50006, 'No existe periodo Cretacico en era Mesozoico.', 1;

  DECLARE @Catalogo TABLE (
    etiqueta         VARCHAR(10)  NOT NULL,
    nombre_correcto  VARCHAR(255) NOT NULL,
    categoria_codigo VARCHAR(10)  NOT NULL,
    fecha_registro   DATE         NOT NULL,
    imagen_nombre    VARCHAR(260) NOT NULL
  );

  INSERT INTO @Catalogo (etiqueta, nombre_correcto, categoria_codigo, fecha_registro, imagen_nombre)
  VALUES
  ('F001','Diplodocus longus','PAL','2024-01-01','Diplodocus_longus.jpg'),
  ('F002','Tyrannosaurus rex (craneo)','PAL','2024-01-02','Tyrannosaurus_rex_craneo.jpg'),
  ('F003','Tyrannosaurus rex (esqueleto)','PAL','2024-01-03','Tyrannosaurus_rex_esqueleto.jpg'),
  ('F004','Stegosaurus ungulatus','PAL','2024-01-04','Stegosaurus_ungulatus.avif'),
  ('F005','Ichthyosaurus communis','PAL','2024-01-05','Ichthyosaurus_communis.jpg'),
  ('F006','Irritator challengeri','PAL','2024-01-06','Irritator_challengeri.jpg'),
  ('F007','Psittacosaurus mongoliensis','PAL','2024-01-07','Psittacosaurus_mongoliensis.jpg'),
  ('F008','Stegosaurus ungulatus (exhibicion)','PAL','2024-01-08','Stegosaurus_ungulatus_exhibicion.jpg'),
  ('F009','Iguanodon (fosil en roca)','PAL','2024-01-09','Iguanodon_fosil_roca.jpg'),
  ('F010','Protorosaurus speneri','PAL','2024-01-10','Protorosaurus_reptil_fosil.jpg'),
  ('F011','Sinornithosaurus (dinosaurio emplumado)','PAL','2024-01-11','Sinornithosaurus_dinosaurio_emplumado.jpg'),
  ('F012','Scipionyx samniticus','PAL','2024-01-12','Scipionyx_samniticus_fosil_roca.jpg'),
  ('F013','Smilodon fatalis (craneo)','PAL','2024-01-13','Smilodon_fatalis_craneo.jpg'),
  ('F014','Smilodon californicus','PAL','2024-01-14','Smilodon_californicus.jpg'),
  ('F015','Diplomystus dentatus','PAL','2024-01-15','Diplomystus_pez_fosil.jpg'),
  ('F016','Cryptolithus (trilobita)','PAL','2024-01-16','Cryptolithus_trilobita.jpg'),
  ('F017','Elrathia kingii (trilobita)','PAL','2024-01-17','Elrathia_trilobita.jpg'),
  ('F018','Trilobites - colonia','PAL','2024-01-18','Trilobita_colonia_fosil_roca.webp'),
  ('F019','Perisphinctes (ammonites)','PAL','2024-01-19','Perisphinctes_ammonites.jpg'),
  ('F020','Ammonites (seccion transversal)','PAL','2024-01-20','Ammonites_seccion_transversal.jpg'),
  ('F021','Ammonites (molde interno)','PAL','2024-01-21','Ammonites_molde_interno.jpg'),
  ('F022','Cleoniceras (ammonites en corte)','PAL','2024-01-22','Cleoniceras_ammonites_corte.jpg'),
  ('F023','Ammonites multiples en roca gris','PAL','2024-01-23','Ammonites_multiples_roca_gris.jpg'),
  ('F024','Ammonites en arenisca','PAL','2024-01-24','Ammonites_grupo_roca_arenisca.jpg'),
  ('F025','Pecten (bivalvo fosil)','PAL','2024-01-25','Pecten_bivalvo_fosil.jpg'),
  ('F026','Crinoidea (tallo fosil)','PAL','2024-01-26','Crinoidea_tallo_fosil_roca.jpg'),
  ('F027','Neuropteris (helecho fosil)','PAL','2024-01-27','Neuropteris_helecho_fosil.jpg'),
  ('F028','Pecopteris (helecho carbonifero)','PAL','2024-01-28','Pecopteris_helecho_carbonifero.jpg'),
  ('F029','Zamites (fronda fosil)','PAL','2024-01-29','Zamites_fronda_fosil_roca.jpg'),
  ('F030','Hippocampus (caballito de mar fosil)','PAL','2024-01-30','Hippocampus_fosil_roca.jpg'),
  ('F031','Magnetita (mineral)','MIN','2024-01-31','Magnetita_roca_mineral.jpg'),
  ('F032','Caliza fosilifera (multiples organismos)','ROC','2024-02-01','Caliza_fosilifera_multiple_organismos.jpg'),
  ('F033','Excavacion de sauropodo (campo)','PAL','2024-02-02','Excavacion_sauropodo_campo.jpg'),
  ('F034','Excavacion de ammonites (hallazgo)','PAL','2024-02-03','Excavacion_ammonites_hallazgo.avif'),
  ('F035','Excavacion de Stegosaurus','PAL','2024-02-04','Stegosaurus_fosil_excavacion.avif'),
  ('F036','Excavacion de teropodo (herramientas)','PAL','2024-02-05','Excavacion_theropoda_herramientas.jpg'),
  ('F037','Restos de teropodo en arena','PAL','2024-02-06','Theropoda_fosil_arena.jpg'),
  ('F038','Excavacion equipo - Tyrannosaurus rex','PAL','2024-02-07','Tyrannosaurus_rex_excavacion_equipo.jpg'),
  ('F039','Excavacion de vertebras de sauropodo','PAL','2024-02-08','Excavacion_sauropodo_vertebras.jpg'),
  ('F040','Excavacion de craneo de Tyrannosaurus rex','PAL','2024-02-09','Tyrannosaurus_rex_excavacion_craneo.jpg'),
  ('F041','Excavacion en sitio - Tyrannosaurus rex','PAL','2024-02-10','Tyrannosaurus_rex_excavacion_sitio.jpg');

  DECLARE
    @etiqueta VARCHAR(10),
    @nombre VARCHAR(255),
    @categoria_codigo VARCHAR(10),
    @fecha DATE,
    @imagen VARCHAR(260),
    @categoria_id INT,
    @fosil_id INT,
    @nuevo_id INT,
    @nuevo_codigo VARCHAR(30),
    @descripcion VARCHAR(MAX),
    @ext VARCHAR(20),
    @nombre_cientifico VARCHAR(255),
    @explorador_asignado INT,
    @n INT,
    @carpeta VARCHAR(80);

  DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
    SELECT etiqueta, nombre_correcto, categoria_codigo, fecha_registro, imagen_nombre
    FROM @Catalogo
    ORDER BY etiqueta;

  OPEN cur;
  FETCH NEXT FROM cur INTO @etiqueta, @nombre, @categoria_codigo, @fecha, @imagen;

  WHILE @@FETCH_STATUS = 0
  BEGIN
    SET @fosil_id = NULL;
    SET @nuevo_id = NULL;
    SET @nuevo_codigo = NULL;

    SELECT @categoria_id = id
    FROM CATEGORIA_FOSIL
    WHERE codigo = @categoria_codigo;

    IF @categoria_id IS NULL
      THROW 50006, 'Categoria no encontrada para codigo.', 1;

    SELECT TOP 1 @fosil_id = id
    FROM FOSIL
    WHERE deleted_at IS NULL
      AND nombre = @nombre
      AND fecha_hallazgo = @fecha
    ORDER BY id DESC;

    SET @n = TRY_CAST(SUBSTRING(@etiqueta, 2, 10) AS INT);
    SET @explorador_asignado = CASE WHEN @n BETWEEN 1 AND 22 THEN @explorador_id ELSE @miguel_id END;

    IF @fosil_id IS NULL
    BEGIN
      SET @descripcion = CONCAT('Registro auto-cargado desde inventario de imagenes (AUTO_UNICO): ', @nombre, '.');

      EXEC sp_registrar_fosil
        @canton_id             = @canton_id,
        @categoria_id          = @categoria_id,
        @era_id                = @era_id,
        @periodo_id            = @periodo_id,
        @explorador_id         = @explorador_asignado,
        @nombre                = @nombre,
        @descripcion_general   = @descripcion,
        @latitud               = 9.7489000,
        @longitud              = -83.7534000,
        @altitud_msnm          = NULL,
        @descripcion_ubicacion = 'Costa Rica, San Jose Centro',
        @fecha_hallazgo        = @fecha,
        @nuevo_id              = @nuevo_id OUTPUT,
        @nuevo_codigo          = @nuevo_codigo OUTPUT;

      SET @fosil_id = @nuevo_id;
    END

    EXEC sp_cambiar_estado_fosil @fosil_id, 'publicado', @admin_id, NULL;

    SET @nombre_cientifico = CASE
      WHEN CHARINDEX('(', @nombre) > 0 THEN LTRIM(RTRIM(LEFT(@nombre, CHARINDEX('(', @nombre) - 1)))
      ELSE @nombre
    END;

    UPDATE FOSIL
    SET nombre_comun = @nombre,
        nombre_cientifico = @nombre_cientifico,
        updated_at = GETDATE()
    WHERE id = @fosil_id
      AND deleted_at IS NULL;

    SET @ext = LOWER(RIGHT(@imagen, CHARINDEX('.', REVERSE(@imagen)) - 1));
    IF @ext = 'jpg' SET @ext = 'jpeg';

    IF NOT EXISTS (
      SELECT 1
      FROM MULTIMEDIA
      WHERE fosil_id = @fosil_id
        AND nombre_archivo = @imagen
        AND deleted_at IS NULL
    )
    BEGIN
      SET @carpeta = CASE
        WHEN @imagen LIKE '%Excavacion%' OR @imagen LIKE '%excavacion%' THEN 'paleontologico-especifico'
        WHEN @imagen LIKE 'Tyrannosaurus_rex_excavacion%' THEN 'paleontologico-especifico'
        WHEN @imagen LIKE 'Stegosaurus_fosil_excavacion%' THEN 'paleontologico-especifico'
        WHEN @imagen = 'Magnetita_roca_mineral.jpg' THEN 'minerales'
        WHEN @imagen = 'Caliza_fosilifera_multiple_organismos.jpg' THEN 'rocas'
        WHEN @imagen LIKE '%ammonites%' OR @imagen LIKE '%trilobit%' OR @imagen LIKE '%Crinoidea%' OR @imagen LIKE '%helecho%' OR @imagen LIKE '%fronda%' THEN 'mineralizados'
        WHEN @imagen LIKE '%roca%' THEN 'rocas'
        ELSE 'generales'
      END;

      INSERT INTO MULTIMEDIA (
        fosil_id,
        tipo,
        subtipo,
        url,
        nombre_archivo,
        formato,
        descripcion,
        es_principal,
        orden
      ) VALUES (
        @fosil_id,
        'imagen',
        'portada',
        CONCAT('/images/fossiles/', @carpeta, '/', @imagen),
        @imagen,
        @ext,
        CONCAT('Imagen principal AUTO_UNICO de ', @nombre),
        1,
        0
      );
    END

    FETCH NEXT FROM cur INTO @etiqueta, @nombre, @categoria_codigo, @fecha, @imagen;
  END

  CLOSE cur;
  DEALLOCATE cur;

  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
GO

SELECT
  COUNT(*) AS fosiles_auto_unico
FROM FOSIL
WHERE deleted_at IS NULL
  AND descripcion_general LIKE 'Registro auto-cargado desde inventario de imagenes (AUTO_UNICO):%';
GO

SELECT
  f.id,
  f.codigo_unico,
  f.nombre,
  f.estado,
  f.fecha_hallazgo,
  m.nombre_archivo,
  m.url
FROM FOSIL f
LEFT JOIN MULTIMEDIA m
  ON m.fosil_id = f.id
 AND m.deleted_at IS NULL
 AND m.es_principal = 1
WHERE f.deleted_at IS NULL
  AND f.descripcion_general LIKE 'Registro auto-cargado desde inventario de imagenes (AUTO_UNICO):%'
ORDER BY f.id;
GO
