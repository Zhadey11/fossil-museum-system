/*
  Migración: renombre de archivos multimedia a nombres científicos,
  rutas por carpeta (PAL/FOS/MIN/ROC → paleontologico-especifico/generales/mineralizados/rocas),
  enriquecimiento de FOSIL solo en campos vacíos, taxonomía si faltaba,
  subtipos excavación→antes, principal→después, y publicación del fósil 16 si aplica.

  Ejecutar en SQL Server contra FosilesDB después del núcleo 01–06 (opcional en instalaciones nuevas).

  Instalaciones nuevas: 05_datos_prueba.sql ya incluye los 41 archivos con rutas nuevas;
  este script entonces actualiza 0 filas en los UPDATE legacy, omite INSERT duplicados (NOT EXISTS)
  y aplica enriquecimiento de FOSIL + subtipos + publicación.

  Bases antiguas (multimedia con nombres previos a abril 2026): los UPDATE por nombre_archivo
  alinean url/nombre con el renombre en disco.

  Nota: endurecedor, completitud, fractura, meteorización, abrasión, medidas y zona UTM
  no existen como columnas en FOSIL; se agregan en bloque dentro de descripcion_detallada
  solo cuando ese campo está vacío.
*/

USE FosilesDB;
GO

SET NOCOUNT ON;
BEGIN TRANSACTION;

BEGIN TRY
    /* ---------- 1. MULTIMEDIA: renombrar url + nombre_archivo + formato ---------- */

    DECLARE @p NVARCHAR(40) = N'paleontologico-especifico';
    DECLARE @g NVARCHAR(20) = N'generales';
    DECLARE @m NVARCHAR(20) = N'mineralizados';
    DECLARE @r NVARCHAR(10) = N'rocas';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Excavacion_ammonites_hallazgo.avif'),
        nombre_archivo = N'Excavacion_ammonites_hallazgo.avif',
        formato = N'avif'
    WHERE deleted_at IS NULL AND nombre_archivo = N'paleontologia-1-1024x576.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Tyrannosaurus_rex_excavacion_equipo.jpg'),
        nombre_archivo = N'Tyrannosaurus_rex_excavacion_equipo.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'paleontologists-carefully-excavating-a-tyrannosaurus-rex-fossil-skeleton-at-a-dig-site-photo.jpeg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Tyrannosaurus_rex_excavacion_sitio.jpg'),
        nombre_archivo = N'Tyrannosaurus_rex_excavacion_sitio.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'de-que-trabaja-un-paleontologo.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Excavacion_theropoda_herramientas.jpg'),
        nombre_archivo = N'Excavacion_theropoda_herramientas.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'paleontologia-reforca-visao-biblica-da-criacao-do-mundo2.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Stegosaurus_ungulatus.avif'),
        nombre_archivo = N'Stegosaurus_ungulatus.avif',
        formato = N'avif'
    WHERE deleted_at IS NULL AND nombre_archivo = N'paleontologia-e1551662411437.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Psittacosaurus_mongoliensis.jpg'),
        nombre_archivo = N'Psittacosaurus_mongoliensis.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'por-que-estudiar-paleontologia.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Stegosaurus_ungulatus_exhibicion.jpg'),
        nombre_archivo = N'Stegosaurus_ungulatus_exhibicion.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'paleontologia_que_es_y_que_estudia_6274_600.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @g, '/Excavacion_sauropodo_campo.jpg'),
        nombre_archivo = N'Excavacion_sauropodo_campo.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'260107-fosil-1-800x450-atiempo-780x450.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @g, '/Diplodocus_longus.jpg'),
        nombre_archivo = N'Diplodocus_longus.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'descarga.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Perisphinctes_ammonites.jpg'),
        nombre_archivo = N'Perisphinctes_ammonites.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'fosil.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Ammonites_molde_interno.jpg'),
        nombre_archivo = N'Ammonites_molde_interno.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'Molde_interno_erosionado.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @g, '/Irritator_challengeri.jpg'),
        nombre_archivo = N'Irritator_challengeri.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'irritator-challengeri.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @g, '/Smilodon_fatalis_craneo.jpg'),
        nombre_archivo = N'Smilodon_fatalis_craneo.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'RPF-memoria-fossil-cranio-2024-09-1140.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Cleoniceras_ammonites_corte.jpg'),
        nombre_archivo = N'Cleoniceras_ammonites_corte.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'Ammo_hueco.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Diplomystus_pez_fosil.jpg'),
        nombre_archivo = N'Diplomystus_pez_fosil.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'Que-es-un-fosil-8.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Pecten_bivalvo_fosil.jpg'),
        nombre_archivo = N'Pecten_bivalvo_fosil.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'shell-214745-1280-cke.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Ammonites_seccion_transversal.jpg'),
        nombre_archivo = N'Ammonites_seccion_transversal.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'tipos_de_fosilizacion_y_sus_caracteristicas_3313_600.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Hippocampus_fosil_roca.jpg'),
        nombre_archivo = N'Hippocampus_fosil_roca.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'c3585bc75b6a327a04865eedf5ada051.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @g, '/Sinornithosaurus_dinosaurio_emplumado.jpg'),
        nombre_archivo = N'Sinornithosaurus_dinosaurio_emplumado.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'nuevo_dinosaurio_patagonia_argentina_carnivoro_5.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @r, '/Theropoda_fosil_arena.jpg'),
        nombre_archivo = N'Theropoda_fosil_arena.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'fosil-en-piedra.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @p, '/Neuropteris_helecho_fosil.jpg'),
        nombre_archivo = N'Neuropteris_helecho_fosil.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'vegetales-y-otros-fosiles-1024x1024_oEJg0Lp.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @r, '/Caliza_fosilifera_multiple_organismos.jpg'),
        nombre_archivo = N'Caliza_fosilifera_multiple_organismos.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'roca-fosil-magnetica-1-1080x675.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Ammonites_multiples_roca_gris.jpg'),
        nombre_archivo = N'Ammonites_multiples_roca_gris.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'GettyImages-1071562884fosils.webp';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Cryptolithus_trilobita.jpg'),
        nombre_archivo = N'Cryptolithus_trilobita.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'fosil-2.jpg';

    UPDATE MULTIMEDIA SET
        url = CONCAT('/images/fossiles/', @m, '/Elrathia_trilobita.jpg'),
        nombre_archivo = N'Elrathia_trilobita.jpg',
        formato = N'jpeg'
    WHERE deleted_at IS NULL AND nombre_archivo = N'596d9e09da26a.jpg';

    /* ---------- 1b. Nuevas filas multimedia (archivos adicionales en disco) ---------- */

    DECLARE @ord10 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 10 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Tyrannosaurus_rex_craneo.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (10, N'imagen', N'general', CONCAT('/images/fossiles/', @p, '/Tyrannosaurus_rex_craneo.jpg'), N'Tyrannosaurus_rex_craneo.jpg', N'jpeg', N'Cráneo de tiranosaurio: referencia morfológica para el registro de hoja fósil.', 0, @ord10 + 1),
    (10, N'imagen', N'general', CONCAT('/images/fossiles/', @p, '/Tyrannosaurus_rex_esqueleto.jpg'), N'Tyrannosaurus_rex_esqueleto.jpg', N'jpeg', N'Esqueleto montado de tiranosaurio en contexto museográfico.', 0, @ord10 + 2),
    (10, N'imagen', N'general', CONCAT('/images/fossiles/', @g, '/Smilodon_californicus.jpg'), N'Smilodon_californicus.jpg', N'jpeg', N'Smilodonte de California: referencia de mamífero fósil del Pleistoceno.', 0, @ord10 + 3),
    (10, N'imagen', N'antes', CONCAT('/images/fossiles/', @p, '/Tyrannosaurus_rex_excavacion_craneo.jpg'), N'Tyrannosaurus_rex_excavacion_craneo.jpg', N'jpeg', N'Cráneo de Tyrannosaurus en bloque antes de consolidación en laboratorio.', 0, @ord10 + 4);

    DECLARE @ord1 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 1 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Ichthyosaurus_communis.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (1, N'imagen', N'general', CONCAT('/images/fossiles/', @p, '/Ichthyosaurus_communis.jpg'), N'Ichthyosaurus_communis.jpg', N'jpeg', N'Ictiosaurio: reptil marino del Jurásico como referencia para el diente de mosasaurio catalogado.', 0, @ord1 + 1);

    DECLARE @ord7 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 7 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Iguanodon_fosil_roca.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (7, N'imagen', N'general', CONCAT('/images/fossiles/', @r, '/Iguanodon_fosil_roca.jpg'), N'Iguanodon_fosil_roca.jpg', N'jpeg', N'Iguanodón en matriz rocosa: referencia de dinosaurio ornitópodo del Cretácico.', 0, @ord7 + 1),
    (7, N'imagen', N'general', CONCAT('/images/fossiles/', @m, '/Ammonites_grupo_roca_arenisca.jpg'), N'Ammonites_grupo_roca_arenisca.jpg', N'jpeg', N'Grupo de amonitas en arenisca; contexto sedimentario del registro de amonite.', 0, @ord7 + 2);

    DECLARE @ord9 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 9 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Protorosaurus_reptil_fosil.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (9, N'imagen', N'general', CONCAT('/images/fossiles/', @p, '/Protorosaurus_reptil_fosil.jpg'), N'Protorosaurus_reptil_fosil.jpg', N'jpeg', N'Protorosaurio: arcosaurio basal del Triásico como referencia de reptiles tempranos.', 0, @ord9 + 1),
    (9, N'imagen', N'antes', CONCAT('/images/fossiles/', @p, '/Stegosaurus_fosil_excavacion.avif'), N'Stegosaurus_fosil_excavacion.avif', N'avif', N'Excavación de fósiles de estegosaurio antes del laboratorio.', 0, @ord9 + 2);

    DECLARE @ord3 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 3 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Excavacion_sauropodo_vertebras.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (3, N'imagen', N'antes', CONCAT('/images/fossiles/', @g, '/Excavacion_sauropodo_vertebras.jpg'), N'Excavacion_sauropodo_vertebras.jpg', N'jpeg', N'Excavación de vértebras de saurópodo en campo.', 0, @ord3 + 1),
    (3, N'imagen', N'general', CONCAT('/images/fossiles/', @p, '/Pecopteris_helecho_carbonifero.jpg'), N'Pecopteris_helecho_carbonifero.jpg', N'jpeg', N'Pecópteris del Carbonífero: helecho característico de bosques húmedos antiguos.', 0, @ord3 + 2),
    (3, N'imagen', N'general', CONCAT('/images/fossiles/', @p, '/Zamites_fronda_fosil_roca.jpg'), N'Zamites_fronda_fosil_roca.jpg', N'jpeg', N'Zamites: fronda fósil de cícada relacionada con el registro de flora fósil.', 0, @ord3 + 3);

    DECLARE @ord16 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 16 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Crinoidea_tallo_fosil_roca.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (16, N'imagen', N'general', CONCAT('/images/fossiles/', @m, '/Crinoidea_tallo_fosil_roca.jpg'), N'Crinoidea_tallo_fosil_roca.jpg', N'jpeg', N'Tallo de crinoideo articulado en matriz; equinodermo fósil relacionado con el registro catalogado.', 0, @ord16 + 1);

    DECLARE @ord5 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 5 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Scipionyx_samniticus_fosil_roca.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (5, N'imagen', N'general', CONCAT('/images/fossiles/', @r, '/Scipionyx_samniticus_fosil_roca.jpg'), N'Scipionyx_samniticus_fosil_roca.jpg', N'jpeg', N'Scipionyx samniticus: terópodo juvenil del Cretácico en placa de caliza.', 0, @ord5 + 1);

    DECLARE @ord13 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 13 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Trilobita_colonia_fosil_roca.webp')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (13, N'imagen', N'general', CONCAT('/images/fossiles/', @m, '/Trilobita_colonia_fosil_roca.webp'), N'Trilobita_colonia_fosil_roca.webp', N'webp', N'Colonia de trilobites en superficie rocosa.', 0, @ord13 + 1);

    DECLARE @ord8 INT = (SELECT ISNULL(MAX(orden), 0) FROM MULTIMEDIA WHERE fosil_id = 8 AND deleted_at IS NULL);
    IF NOT EXISTS (SELECT 1 FROM MULTIMEDIA WHERE deleted_at IS NULL AND nombre_archivo = N'Magnetita_roca_mineral.jpg')
    INSERT INTO MULTIMEDIA (fosil_id, tipo, subtipo, url, nombre_archivo, formato, descripcion, es_principal, orden)
    VALUES
    (8, N'imagen', N'analisis', CONCAT('/images/fossiles/', @m, '/Magnetita_roca_mineral.jpg'), N'Magnetita_roca_mineral.jpg', N'jpeg', N'Magnetita masiva en matriz; referencia mineralógica complementaria al registro de pirita cúbica.', 0, @ord8 + 1);

    /* ---------- 1c. Subtipos: excavación → antes; principal limpio → después ---------- */

    UPDATE MULTIMEDIA SET subtipo = N'antes'
    WHERE deleted_at IS NULL
      AND es_principal = 0
      AND LOWER(nombre_archivo) LIKE N'%excavacion%'
      AND subtipo <> N'portada';

    UPDATE MULTIMEDIA SET subtipo = N'despues'
    WHERE deleted_at IS NULL
      AND es_principal = 1
      AND LOWER(ISNULL(nombre_archivo, N'')) NOT LIKE N'%excavacion%';

    /* ---------- 2–4. FOSIL: solo rellenar NULL / blancos (sin pisar datos) ---------- */

    DECLARE @bloque_cientifico NVARCHAR(MAX) = N'
[Datos de campo y preparación — registro automático]
Endurecedor: Paraloid B-72 en fracturas menores.
Completitud: Mayormente completo.
Fractura: Fractura parcial.
Meteorización (0-3): Etapa 1.
Abrasión (0-3): Etapa 1.
Medidas aprox. (cm): largo 42, ancho 28, grosor 8 (referencia de bloque de matriz).
Zona UTM: 16 P (Costa Rica).';

    UPDATE FOSIL SET
        descripcion_estado_orig = N'Espécimen parcialmente cubierto por matriz; superficies visibles sin recubrimiento moderno al momento del hallazgo.'
    WHERE id = 1 AND NULLIF(LTRIM(RTRIM(descripcion_estado_orig)), N'') IS NULL;

    UPDATE FOSIL SET
        contexto_geologico = N'Lutitas y margas del Cretácico Superior; ambiente marino epicontinental, bioestrato con moluscos y vertebrados marinos.'
    WHERE id = 1 AND NULLIF(LTRIM(RTRIM(contexto_geologico)), N'') IS NULL;

    UPDATE FOSIL SET
        descripcion_detallada = @bloque_cientifico
    WHERE id = 1 AND descripcion_detallada IS NULL;

    UPDATE FOSIL SET
        latitud = COALESCE(latitud, 9.9012000), longitud = COALESCE(longitud, -83.6775000)
    WHERE id = 1 AND (latitud IS NULL OR longitud IS NULL);

    /* Repetir bloque mínimo para otros fósiles públicos con metadatos científicos vacíos */
    UPDATE FOSIL SET descripcion_estado_orig = N'Preservación en calcita y fragmentos articulados; coloración uniforme por diagenesis.'
    WHERE id IN (2,3,4,5,7,8,9,10,11,13,14,15,16) AND NULLIF(LTRIM(RTRIM(descripcion_estado_orig)), N'') IS NULL;

    UPDATE FOSIL SET contexto_geologico = N'Sedimentos volcano-detriticos y calizas platform; estratos medios a superiores con buena exposición en afloramientos locales.'
    WHERE id IN (2,3,4,5,7,8,9,10,11,13,14,15,16) AND NULLIF(LTRIM(RTRIM(contexto_geologico)), N'') IS NULL;

    UPDATE FOSIL SET descripcion_detallada = @bloque_cientifico
    WHERE id IN (2,3,4,5,7,8,9,10,11,13,14,15,16) AND descripcion_detallada IS NULL;

    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 9.5667000), longitud = COALESCE(longitud, -82.8500000) WHERE id = 2 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.3167000), longitud = COALESCE(longitud, -84.5167000) WHERE id = 3 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.1483000), longitud = COALESCE(longitud, -85.4517000) WHERE id = 4 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 8.7167000), longitud = COALESCE(longitud, -83.5833000) WHERE id = 5 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 9.8833000), longitud = COALESCE(longitud, -84.0500000) WHERE id = 7 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 9.9983000), longitud = COALESCE(longitud, -84.1167000) WHERE id = 8 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.0200000), longitud = COALESCE(longitud, -83.7400000) WHERE id = 9 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.0900000), longitud = COALESCE(longitud, -84.4717000) WHERE id = 10 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.6333000), longitud = COALESCE(longitud, -85.4333000) WHERE id = 11 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 9.8600000), longitud = COALESCE(longitud, -83.9200000) WHERE id = 13 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 9.8500000), longitud = COALESCE(longitud, -84.3167000) WHERE id = 14 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.2667000), longitud = COALESCE(longitud, -85.5833000) WHERE id = 15 AND (latitud IS NULL OR longitud IS NULL);
    UPDATE FOSIL SET
        latitud  = COALESCE(latitud, 10.0700000), longitud = COALESCE(longitud, -83.3400000) WHERE id = 16 AND (latitud IS NULL OR longitud IS NULL);

    /* Categoría de FOSIL: no se modifica aquí (respetar datos existentes). */

    /* ---------- 5. Taxonomía: insertar filas solo si no existen; enlazar si taxonomia_id IS NULL ---------- */

    IF NOT EXISTS (SELECT 1 FROM TAXONOMIA WHERE genero = N'Mosasaurus' AND especie = N'Mosasaurus hoffmannii')
        INSERT INTO TAXONOMIA (reino, filo, clase, orden, familia, genero, especie)
        VALUES (N'Animalia', N'Chordata', N'Reptilia', N'Squamata', N'Mosasauridae', N'Mosasaurus', N'Mosasaurus hoffmannii');

    UPDATE f SET f.taxonomia_id = t.id
    FROM FOSIL f
    INNER JOIN TAXONOMIA t ON t.genero = N'Mosasaurus' AND t.especie = N'Mosasaurus hoffmannii'
    WHERE f.id = 1 AND f.taxonomia_id IS NULL;

    /* ---------- 6. Explorador: sin pisar explorador_id (siempre NOT NULL en esquema) ---------- */
    /* Los datos de prueba ya asignan explorador; no se modifica explorador_id aquí. */

    /* ---------- 7. Publicar fósil en revisión si corresponde al catálogo enriquecido ---------- */

    IF EXISTS (SELECT 1 FROM sys.procedures WHERE name = N'sp_cambiar_estado_fosil')
    BEGIN
        EXEC sp_cambiar_estado_fosil @fosil_id = 16, @nuevo_estado = N'publicado', @admin_id = 1, @notas = N'Catálogo enriquecido y multimedia científica alineada; aprobación por migración 08.';
    END;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

PRINT N'Migración 99_migracion_renombres_cientificos.sql aplicada (revisar mensajes y filas afectadas).';
GO
