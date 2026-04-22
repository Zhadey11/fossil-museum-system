USE FosilesDB;
GO

/*
  Resetea únicamente los datos cargados por 07/08 para poder recargar limpio.
  No toca catálogos base ni usuarios.
*/

SET NOCOUNT ON;

BEGIN TRY
  BEGIN TRANSACTION;

  ;WITH target AS (
    SELECT f.id
    FROM FOSIL f
    WHERE f.deleted_at IS NULL
      AND (
        f.descripcion_general LIKE 'Registro auto-cargado desde inventario de imagenes (AUTO_UNICO):%'
        OR EXISTS (
          SELECT 1
          FROM MULTIMEDIA m
          WHERE m.fosil_id = f.id
            AND m.deleted_at IS NULL
            AND m.nombre_archivo IN (
              'Diplodocus_longus.jpg','Tyrannosaurus_rex_craneo.jpg','Tyrannosaurus_rex_esqueleto.jpg','Stegosaurus_ungulatus.avif',
              'Ichthyosaurus_communis.jpg','Irritator_challengeri.jpg','Psittacosaurus_mongoliensis.jpg','Stegosaurus_ungulatus_exhibicion.jpg',
              'Iguanodon_fosil_roca.jpg','Protorosaurus_reptil_fosil.jpg','Sinornithosaurus_dinosaurio_emplumado.jpg','Scipionyx_samniticus_fosil_roca.jpg',
              'Smilodon_fatalis_craneo.jpg','Smilodon_californicus.jpg','Diplomystus_pez_fosil.jpg','Cryptolithus_trilobita.jpg',
              'Elrathia_trilobita.jpg','Trilobita_colonia_fosil_roca.webp','Perisphinctes_ammonites.jpg','Ammonites_seccion_transversal.jpg',
              'Ammonites_molde_interno.jpg','Cleoniceras_ammonites_corte.jpg','Ammonites_multiples_roca_gris.jpg','Ammonites_grupo_roca_arenisca.jpg',
              'Pecten_bivalvo_fosil.jpg','Crinoidea_tallo_fosil_roca.jpg','Neuropteris_helecho_fosil.jpg','Pecopteris_helecho_carbonifero.jpg',
              'Zamites_fronda_fosil_roca.jpg','Hippocampus_fosil_roca.jpg','Magnetita_roca_mineral.jpg','Caliza_fosilifera_multiple_organismos.jpg',
              'Excavacion_sauropodo_campo.jpg','Excavacion_ammonites_hallazgo.avif','Stegosaurus_fosil_excavacion.avif','Excavacion_theropoda_herramientas.jpg',
              'Theropoda_fosil_arena.jpg','Tyrannosaurus_rex_excavacion_equipo.jpg','Excavacion_sauropodo_vertebras.jpg','Tyrannosaurus_rex_excavacion_craneo.jpg',
              'Tyrannosaurus_rex_excavacion_sitio.jpg'
            )
        )
      )
  )
  UPDATE m
  SET deleted_at = GETDATE()
  FROM MULTIMEDIA m
  INNER JOIN target t ON t.id = m.fosil_id
  WHERE m.deleted_at IS NULL;

  ;WITH target AS (
    SELECT f.id
    FROM FOSIL f
    WHERE f.deleted_at IS NULL
      AND (
        f.descripcion_general LIKE 'Registro auto-cargado desde inventario de imagenes (AUTO_UNICO):%'
        OR EXISTS (
          SELECT 1 FROM MULTIMEDIA m WHERE m.fosil_id = f.id AND m.deleted_at IS NOT NULL
        )
      )
  )
  UPDATE f
  SET deleted_at = GETDATE(),
      estado = 'rechazado',
      updated_at = GETDATE()
  FROM FOSIL f
  INNER JOIN target t ON t.id = f.id;

  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
GO
