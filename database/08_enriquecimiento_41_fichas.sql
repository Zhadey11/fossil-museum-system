USE FosilesDB;
GO

/*
  Enriquecimiento final de 41 fichas (sin autollenado parcial).
  - Balance geográfico para mapa (7 cantones de CR en rotación)
  - Descripciones públicas + ficha técnica breve
  - Era/periodo consistentes por tipo de registro
  - Taxonomía aplicada cuando corresponde

  Requiere haber ejecutado 07_catalogo_43_desde_imagenes.sql
*/

SET NOCOUNT ON;

BEGIN TRY
  BEGIN TRANSACTION;

  DECLARE @Cantones TABLE (
    pos INT PRIMARY KEY,
    canton_nombre VARCHAR(100) NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL
  );

  INSERT INTO @Cantones (pos, canton_nombre, lat, lng) VALUES
    (1, 'San Jose Centro', 9.9333000, -84.0833000),
    (2, 'Alajuela Centro', 10.0163000, -84.2116000),
    (3, 'Cartago Centro', 9.8644000, -83.9194000),
    (4, 'Heredia Centro', 9.9986000, -84.1165000),
    (5, 'Liberia', 10.6350000, -85.4377000),
    (6, 'Puntarenas Centro', 9.9763000, -84.8384000),
    (7, 'Limon Centro', 9.9907000, -83.0359000);

  DECLARE @Ficha TABLE (
    orden INT IDENTITY(1,1) PRIMARY KEY,
    imagen_nombre VARCHAR(260) NOT NULL,
    nombre_publico VARCHAR(255) NOT NULL,
    era_nombre VARCHAR(80) NOT NULL,
    periodo_nombre VARCHAR(80) NOT NULL,
    reino VARCHAR(120) NULL,
    filo VARCHAR(120) NULL,
    clase VARCHAR(120) NULL,
    orden_tax VARCHAR(120) NULL,
    familia VARCHAR(120) NULL,
    genero VARCHAR(120) NULL,
    especie VARCHAR(120) NULL,
    contexto_geologico VARCHAR(500) NOT NULL,
    largo_cm DECIMAL(10,2) NULL,
    ancho_cm DECIMAL(10,2) NULL,
    grosor_cm DECIMAL(10,2) NULL,
    completitud VARCHAR(80) NULL,
    fractura VARCHAR(80) NULL,
    meteorizacion VARCHAR(40) NULL,
    abrasion VARCHAR(40) NULL,
    cantera_sitio VARCHAR(255) NULL
  );

  INSERT INTO @Ficha (
    imagen_nombre, nombre_publico, era_nombre, periodo_nombre,
    reino, filo, clase, orden_tax, familia, genero, especie,
    contexto_geologico, largo_cm, ancho_cm, grosor_cm,
    completitud, fractura, meteorizacion, abrasion, cantera_sitio
  ) VALUES
  ('Diplodocus_longus.jpg','Diplodocus longus','Mesozoico','Jurasico','Animalia','Chordata','Reptilia','Saurischia','Diplodocidae','Diplodocus','longus','Depósitos continentales de baja energía con lutitas y arenas finas.',52,24,10,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Tyrannosaurus_rex_craneo.jpg','Tyrannosaurus rex (craneo)','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Saurischia','Tyrannosauridae','Tyrannosaurus','rex','Ambientes fluviales con depósitos arenosos y limosos.',34,22,18,'alta','media','baja','baja','Cantera de referencia StoneWake'),
  ('Tyrannosaurus_rex_esqueleto.jpg','Tyrannosaurus rex (esqueleto)','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Saurischia','Tyrannosauridae','Tyrannosaurus','rex','Depósitos fluviales de planicie aluvial.',120,60,40,'media','media','baja','baja','Cantera de referencia StoneWake'),
  ('Stegosaurus_ungulatus.avif','Stegosaurus ungulatus','Mesozoico','Jurasico','Animalia','Chordata','Reptilia','Ornithischia','Stegosauridae','Stegosaurus','ungulatus','Ambientes continentales con depósitos de baja energía.',45,28,12,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Ichthyosaurus_communis.jpg','Ichthyosaurus communis','Mesozoico','Jurasico','Animalia','Chordata','Reptilia','Ichthyosauria','Ichthyosauridae','Ichthyosaurus','communis','Depósitos marinos con sedimentos finos y carbonatados.',60,30,14,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Irritator_challengeri.jpg','Irritator challengeri','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Saurischia','Spinosauridae','Irritator','challengeri','Ambientes fluviales y costeros con sedimentos mixtos.',32,20,11,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Psittacosaurus_mongoliensis.jpg','Psittacosaurus mongoliensis','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Ornithischia','Psittacosauridae','Psittacosaurus','mongoliensis','Depósitos continentales semiáridos con arenas finas.',28,18,9,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Stegosaurus_ungulatus_exhibicion.jpg','Stegosaurus ungulatus (exhibicion)','Mesozoico','Jurasico','Animalia','Chordata','Reptilia','Ornithischia','Stegosauridae','Stegosaurus','ungulatus','Ambientes continentales de depósito lento.',110,55,35,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Iguanodon_fosil_roca.jpg','Iguanodon (fosil en roca)','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Ornithischia','Iguanodontidae','Iguanodon','sp.','Ambientes fluviales con depósitos arenosos y limosos.',42,26,15,'media','media','baja','baja','Cantera de referencia StoneWake'),
  ('Protorosaurus_reptil_fosil.jpg','Protorosaurus (reptil fosil)','Paleozoico','Permico','Animalia','Chordata','Reptilia','Protorosauria','Protorosauridae','Protorosaurus','sp.','Depósitos continentales con lutitas finas.',30,16,8,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Sinornithosaurus_dinosaurio_emplumado.jpg','Sinornithosaurus (emplumado)','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Saurischia','Dromaeosauridae','Sinornithosaurus','sp.','Depósitos lacustres de baja energía.',36,20,9,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Scipionyx_samniticus_fosil_roca.jpg','Scipionyx samniticus','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Saurischia','Compsognathidae','Scipionyx','samniticus','Ambientes lacustres con sedimentos finos.',25,14,7,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Smilodon_fatalis_craneo.jpg','Smilodon fatalis (craneo)','Cenozoico','Cuaternario','Animalia','Chordata','Mammalia','Carnivora','Felidae','Smilodon','fatalis','Depósitos de cuevas y sedimentos continentales.',33,21,17,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Smilodon_californicus.jpg','Smilodon californicus','Cenozoico','Cuaternario','Animalia','Chordata','Mammalia','Carnivora','Felidae','Smilodon','californicus','Depósitos continentales con acumulación orgánica.',40,25,18,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Diplomystus_pez_fosil.jpg','Diplomystus (pez fosil)','Cenozoico','Paleogeno','Animalia','Chordata','Actinopterygii','Clupeiformes','Diplomystidae','Diplomystus','sp.','Depósitos lacustres de baja energía.',22,12,3,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Cryptolithus_trilobita.jpg','Cryptolithus (trilobite)','Paleozoico','Ordovicico','Animalia','Arthropoda','Trilobita','Asaphida','Trinucleidae','Cryptolithus','sp.','Ambientes marinos someros con sedimentos finos.',12,9,2,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Elrathia_trilobita.jpg','Elrathia (trilobite)','Paleozoico','Cambrico','Animalia','Arthropoda','Trilobita','Ptychopariida','Elrathiidae','Elrathia','sp.','Depósitos marinos con lutitas finas.',10,7,2,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Trilobita_colonia_fosil_roca.webp','Trilobita (colonia en roca)','Paleozoico','Ordovicico',NULL,NULL,NULL,NULL,NULL,'Trilobita','sp.','Ambientes marinos de depósito lento.',30,22,6,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Perisphinctes_ammonites.jpg','Perisphinctes (ammonite)','Mesozoico','Jurasico','Animalia','Mollusca','Cephalopoda','Ammonitida','Perisphinctidae','Perisphinctes','sp.','Depósitos marinos carbonatados.',18,18,5,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Ammonites_seccion_transversal.jpg','Ammonites (seccion transversal)','Mesozoico','Jurasico','Animalia','Mollusca','Cephalopoda','Ammonitida',NULL,'Ammonites','sp.','Ambientes marinos con sedimentación carbonatada.',16,16,4,'alta','nula','baja','baja','Cantera de referencia StoneWake'),
  ('Ammonites_molde_interno.jpg','Ammonites (molde interno)','Mesozoico','Jurasico','Animalia','Mollusca','Cephalopoda','Ammonitida',NULL,'Ammonites','sp.','Depósitos marinos de baja energía.',17,17,5,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Cleoniceras_ammonites_corte.jpg','Cleoniceras (ammonite corte)','Mesozoico','Cretacico','Animalia','Mollusca','Cephalopoda','Ammonitida','Cleoniceratidae','Cleoniceras','sp.','Depósitos marinos carbonatados.',19,19,4,'alta','nula','baja','baja','Cantera de referencia StoneWake'),
  ('Ammonites_multiples_roca_gris.jpg','Ammonites (multiples en roca)','Mesozoico','Jurasico','Animalia','Mollusca','Cephalopoda','Ammonitida',NULL,'Ammonites','sp.','Ambientes marinos con sedimentación continua.',35,28,8,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Ammonites_grupo_roca_arenisca.jpg','Ammonites (grupo en arenisca)','Mesozoico','Jurasico','Animalia','Mollusca','Cephalopoda','Ammonitida',NULL,'Ammonites','sp.','Depósitos marinos arenosos.',32,26,9,'media','media','baja','baja','Cantera de referencia StoneWake'),
  ('Pecten_bivalvo_fosil.jpg','Pecten (bivalvo fosil)','Cenozoico','Neogeno','Animalia','Mollusca','Bivalvia','Pectinida','Pectinidae','Pecten','sp.','Ambientes marinos someros.',15,15,4,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Crinoidea_tallo_fosil_roca.jpg','Crinoidea (tallo fosil)','Paleozoico','Carbonifero','Animalia','Echinodermata','Crinoidea',NULL,NULL,'Crinoidea','sp.','Depósitos marinos con acumulación bioclástica.',20,8,5,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Neuropteris_helecho_fosil.jpg','Neuropteris (helecho fosil)','Paleozoico','Carbonifero','Plantae','Pteridophyta','Polypodiopsida',NULL,NULL,'Neuropteris','sp.','Ambientes pantanosos con sedimentación fina.',24,18,2,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Pecopteris_helecho_carbonifero.jpg','Pecopteris (helecho carbonifero)','Paleozoico','Carbonifero','Plantae','Pteridophyta','Polypodiopsida',NULL,NULL,'Pecopteris','sp.','Depósitos pantanosos con lutitas.',26,19,2,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Zamites_fronda_fosil_roca.jpg','Zamites (fronda fosil)','Mesozoico','Jurasico','Plantae','Cycadophyta','Cycadopsida',NULL,NULL,'Zamites','sp.','Ambientes continentales cálidos.',30,20,3,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Hippocampus_fosil_roca.jpg','Hippocampus (fosil en roca)','Cenozoico','Neogeno','Animalia','Chordata','Actinopterygii','Syngnathiformes','Syngnathidae','Hippocampus','sp.','Ambientes marinos someros.',14,8,3,'media','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Magnetita_roca_mineral.jpg','Magnetita (mineral)','Cenozoico','Neogeno','Mineralia','Oxidos','Magnetita',NULL,NULL,'Magnetita','sp.','Contexto volcánico con alteración hidrotermal.',14,10,6,'media','nula','baja','baja','Cantera de referencia StoneWake'),
  ('Caliza_fosilifera_multiple_organismos.jpg','Caliza fosilifera (roca)','Cenozoico','Neogeno','Geologia','Sedimentaria','Caliza',NULL,NULL,NULL,NULL,'Ambientes marinos con sedimentación carbonatada.',28,22,10,'alta','leve','baja','baja','Cantera de referencia StoneWake'),
  ('Excavacion_sauropodo_campo.jpg','Excavacion de sauropodo (campo)','Mesozoico','Jurasico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Contexto continental de excavación paleontológica.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Excavacion_ammonites_hallazgo.avif','Excavacion de ammonite (hallazgo)','Mesozoico','Jurasico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Contexto marino sedimentario expuesto.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Stegosaurus_fosil_excavacion.avif','Stegosaurus (excavacion)','Mesozoico','Jurasico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Depósitos continentales en excavación.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Excavacion_theropoda_herramientas.jpg','Excavacion de theropodo (herramientas)','Mesozoico','Cretacico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Contexto de excavación paleontológica.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Theropoda_fosil_arena.jpg','Theropoda (fosil en arena)','Mesozoico','Cretacico','Animalia','Chordata','Reptilia','Saurischia',NULL,'Theropoda','sp.','Ambientes fluviales arenosos.',38,24,12,'media','media','baja','baja','Cantera de referencia StoneWake'),
  ('Tyrannosaurus_rex_excavacion_equipo.jpg','Excavacion T. rex (equipo)','Mesozoico','Cretacico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Contexto de excavación científica.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Excavacion_sauropodo_vertebras.jpg','Excavacion sauropodo (vertebras)','Mesozoico','Jurasico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Depósitos continentales excavados.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Tyrannosaurus_rex_excavacion_craneo.jpg','Excavacion T. rex (craneo)','Mesozoico','Cretacico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Contexto de excavación paleontológica.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake'),
  ('Tyrannosaurus_rex_excavacion_sitio.jpg','Excavacion T. rex (sitio)','Mesozoico','Cretacico',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Contexto de excavación en campo abierto.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Sitio de excavación StoneWake');

  ;WITH target AS (
    SELECT
      f.id,
      m.nombre_archivo,
      ROW_NUMBER() OVER (ORDER BY f.id) AS rn
    FROM FOSIL f
    INNER JOIN MULTIMEDIA m
      ON m.fosil_id = f.id
     AND m.deleted_at IS NULL
     AND m.es_principal = 1
    WHERE f.deleted_at IS NULL
      AND f.descripcion_general LIKE 'Registro auto-cargado desde inventario de imagenes (AUTO_UNICO):%'
  ),
  merged AS (
    SELECT
      t.id,
      t.rn,
      d.*,
      ((t.rn - 1) % 7) + 1 AS pos_canton
    FROM target t
    INNER JOIN @Ficha d ON d.imagen_nombre = t.nombre_archivo
  )
  UPDATE f
  SET
    f.nombre = m.nombre_publico,
    f.nombre_comun = m.nombre_publico,
    f.nombre_cientifico = CASE
      WHEN m.genero IS NOT NULL AND m.genero <> '-' THEN CONCAT(m.genero, ' ', ISNULL(NULLIF(m.especie, '-'), 'sp.'))
      ELSE NULL
    END,
    f.descripcion_general = CONCAT(m.nombre_publico, ': ', LEFT(m.contexto_geologico, 120)),
    f.descripcion_detallada = CONCAT(
      'Registro museográfico de ', m.nombre_publico,
      '. ', m.contexto_geologico,
      ' Esta ficha presenta información técnica de referencia para consulta pública e investigador.'
    ),
    f.contexto_geologico = m.contexto_geologico,
    f.era_id = e.id,
    f.periodo_id = p.id,
    f.canton_id = c.id,
    f.latitud = cb.lat,
    f.longitud = cb.lng,
    f.descripcion_ubicacion = CONCAT(cb.canton_nombre, ', Costa Rica'),
    f.largo_cm = m.largo_cm,
    f.ancho_cm = m.ancho_cm,
    f.grosor_cm = m.grosor_cm,
    f.completitud = m.completitud,
    f.fractura = m.fractura,
    f.meteorizacion = m.meteorizacion,
    f.abrasion = m.abrasion,
    f.zona_utm = '16P',
    f.cantera_sitio = m.cantera_sitio,
    f.fecha_hallazgo = DATEADD(DAY, m.rn * 9, CAST('2019-01-15' AS DATE)),
    f.updated_at = GETDATE()
  FROM merged m
  INNER JOIN FOSIL f ON f.id = m.id
  INNER JOIN ERA_GEOLOGICA e ON e.nombre = m.era_nombre
  INNER JOIN PERIODO_GEOLOGICO p ON p.nombre = m.periodo_nombre AND p.era_id = e.id
  INNER JOIN @Cantones cb ON cb.pos = m.pos_canton
  INNER JOIN CANTON c ON c.nombre = cb.canton_nombre;

  MERGE TAXONOMIA AS tgt
  USING (
    SELECT DISTINCT
      reino, filo, clase, orden_tax, familia, genero, especie
    FROM @Ficha
    WHERE ISNULL(reino, '-') <> '-'
      AND ISNULL(filo, '-') <> '-'
      AND ISNULL(clase, '-') <> '-'
      AND ISNULL(orden_tax, '-') <> '-'
      AND ISNULL(familia, '-') <> '-'
      AND ISNULL(genero, '-') <> '-'
      AND ISNULL(especie, '-') <> '-'
  ) src
  ON tgt.reino = src.reino
 AND tgt.filo = src.filo
 AND tgt.clase = src.clase
 AND tgt.orden = src.orden_tax
 AND tgt.familia = src.familia
 AND tgt.genero = src.genero
 AND tgt.especie = src.especie
  WHEN NOT MATCHED THEN
    INSERT (reino, filo, clase, orden, familia, genero, especie)
    VALUES (src.reino, src.filo, src.clase, src.orden_tax, src.familia, src.genero, src.especie);

  ;WITH target AS (
    SELECT f.id, m.nombre_archivo
    FROM FOSIL f
    INNER JOIN MULTIMEDIA m ON m.fosil_id = f.id AND m.es_principal = 1 AND m.deleted_at IS NULL
    WHERE f.deleted_at IS NULL
      AND f.descripcion_general LIKE '%:%'
  )
  UPDATE f
  SET f.taxonomia_id = t.id,
      f.updated_at = GETDATE()
  FROM target x
  INNER JOIN FOSIL f ON f.id = x.id
  INNER JOIN @Ficha d ON d.imagen_nombre = x.nombre_archivo
  INNER JOIN TAXONOMIA t
    ON t.reino = d.reino
   AND t.filo = d.filo
   AND t.clase = d.clase
   AND t.orden = d.orden_tax
   AND t.familia = d.familia
   AND t.genero = d.genero
   AND t.especie = d.especie
  WHERE ISNULL(d.reino, '-') <> '-'
    AND ISNULL(d.filo, '-') <> '-'
    AND ISNULL(d.clase, '-') <> '-'
    AND ISNULL(d.orden_tax, '-') <> '-'
    AND ISNULL(d.familia, '-') <> '-'
    AND ISNULL(d.genero, '-') <> '-'
    AND ISNULL(d.especie, '-') <> '-';

  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
GO

SELECT
  f.id,
  f.nombre,
  e.nombre AS era,
  p.nombre AS periodo,
  c.nombre AS canton,
  f.latitud,
  f.longitud,
  m.nombre_archivo
FROM FOSIL f
INNER JOIN ERA_GEOLOGICA e ON e.id = f.era_id
INNER JOIN PERIODO_GEOLOGICO p ON p.id = f.periodo_id
INNER JOIN CANTON c ON c.id = f.canton_id
LEFT JOIN MULTIMEDIA m ON m.fosil_id = f.id AND m.es_principal = 1 AND m.deleted_at IS NULL
WHERE f.deleted_at IS NULL
  AND m.nombre_archivo IS NOT NULL
ORDER BY f.id;
GO
