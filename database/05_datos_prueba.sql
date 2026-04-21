USE FosilesDB;
GO

/*
  Datos de prueba para FosilesDB.
  Ejecutar despues de: 01_base_datos.sql, 02_tablas_principales.sql, 03_fulltext_fosiles.sql, 04_indices_vistas_sp.sql
  Luego: 05b_catalogo_demo.sql (opcional; vacío en seed mínimo), después 06_solicitud_y_suscriptores.sql
  (ver database/ORDEN_EJECUCION.txt).

  Seed mínimo: 3 usuarios (admin, investigador, explorador), sin fósiles ni multimedia.
  Contraseña inicial: ver database/ORDEN_EJECUCION.txt (hash @h abajo).

  PERIODO_GEOLOGICO.id por orden de INSERT (lineas INSERT periodos):
  1 Cambrico, 2 Ordovicico, 3 Silurico, 4 Devonico, 5 Carbonifero, 6 Permico,
  7 Triasico, 8 Jurasico, 9 Cretacico, ... (coincide con frontend src/data/timeline.ts).
*/

INSERT INTO ROL (nombre, descripcion) VALUES
('administrador', 'Acceso completo al sistema. CRUD de fosiles, gestion de usuarios y aprobacion de registros.'),
('investigador',  'Acceso a informacion cientifica detallada. Puede crear estudios y colaborar.'),
('explorador',    'Puede registrar nuevos hallazgos en campo y editar solo sus propios registros.'),
('publico',       'Acceso de solo lectura a la informacion publica del catalogo.');
GO

INSERT INTO PAIS (codigo_iso, nombre) VALUES
('CRI','Costa Rica'),('PAN','Panama'),('NIC','Nicaragua'),('HND','Honduras'),
('GTM','Guatemala'),('SLV','El Salvador'),('MEX','Mexico'),('COL','Colombia'),
('ECU','Ecuador'),('PER','Peru'),('BRA','Brasil'),('ARG','Argentina'),
('CHL','Chile'),('ESP','Espana'),('USA','Estados Unidos'),('CAN','Canada');
GO

INSERT INTO PROVINCIA (pais_id, codigo, nombre) VALUES
(1,'SJO','San Jose'),(1,'ALA','Alajuela'),(1,'CAR','Cartago'),
(1,'HER','Heredia'),(1,'GUA','Guanacaste'),(1,'PUN','Puntarenas'),
(1,'LIM','Limon'),(2,'CHR','Chiriqui'),(2,'VRG','Veraguas'),
(2,'COC','Cocle'),(3,'MNG','Managua'),(3,'MAT','Matagalpa'),
(4,'CBA','Comayagua'),(5,'PTN','Peten'),(6,'SAA','Santa Ana');
GO

INSERT INTO CANTON (provincia_id, codigo, nombre) VALUES
(1,'SJC','San Jose Centro'),(1,'DES','Desamparados'),(1,'PUR','Puriscal'),
(1,'TAR','Tarrazu'),(2,'ALC','Alajuela Centro'),(2,'SRM','San Ramon'),
(2,'GRE','Grecia'),(2,'SCA','San Carlos'),(3,'CAC','Cartago Centro'),
(3,'TUR','Turrialba'),(3,'PAR','Paraiso'),(4,'HEC','Heredia Centro'),
(4,'SJM','San Jose Montana'),(5,'LIB','Liberia'),(5,'NIC','Nicoya'),
(5,'SCR','Santa Cruz'),(6,'PNC','Puntarenas Centro'),(6,'OSA','Osa'),
(7,'LMC','Limon Centro'),(7,'TAL','Talamanca'),(7,'MAT','Matina');
GO

INSERT INTO CATEGORIA_FOSIL (codigo, nombre, descripcion) VALUES
('FOS','Fosil General',           'Restos o trazas de organismos del pasado geologico no clasificados en categorias especificas.'),
('MIN','Mineral',                  'Sustancias inorganicas naturales con composicion quimica y estructura cristalina definida.'),
('ROC','Roca',                     'Material solido formado por uno o mas minerales, resultado de procesos geologicos naturales.'),
('PAL','Paleontologico Especifico','Fosiles con valor cientifico excepcional que requieren estudio paleontologico especializado.');
GO

INSERT INTO ERA_GEOLOGICA (nombre, descripcion, ma_inicio, ma_fin) VALUES
('Hadeico',     'Periodo mas antiguo, antes de los primeros registros rocosos conocidos.',                               4600,4000),
('Arcaico',     'Primeras rocas estables. Aparicion de los primeros microorganismos procariontes.',                      4000,2500),
('Proterozoico','Primeros organismos eucariontes. Formacion de supercontinentes. Primeras glaciaciones globales.',       2500,541),
('Paleozoico',  'Gran diversificacion de la vida. Aparicion de vertebrados y plantas terrestres.',                       541,252),
('Mesozoico',   'Era de los dinosaurios. Aparicion de mamiferos y aves. Dominio de reptiles.',                          252,66),
('Cenozoico',   'Era actual. Diversificacion de mamiferos. Evolucion de primates hasta Homo sapiens.',                   66,0);
GO

INSERT INTO PERIODO_GEOLOGICO (era_id, nombre, descripcion, ma_inicio, ma_fin) VALUES
(4,'Cambrico',    'Explosion de la vida multicelular. Aparicion de la mayoria de filos animales.',              541,485),
(4,'Ordovicico',  'Diversificacion marina masiva. Primera extincion masiva al final.',                          485,443),
(4,'Silurico',    'Primeras plantas vasculares terrestres. Diversificacion de peces.',                          443,419),
(4,'Devonico',    'Era de los peces. Aparicion de anfibios. Primeros bosques en tierra.',                       419,359),
(4,'Carbonifero', 'Grandes bosques de helechos. Aparicion de reptiles. Formacion del carbon.',                  359,299),
(4,'Permico',     'Extincion masiva mas grande. Fin del 96 porciento de las especies.',                         299,252),
(5,'Triasico',    'Recuperacion post-extincion. Aparicion de los primeros dinosaurios y mamiferos.',            252,201),
(5,'Jurasico',    'Dominio de grandes dinosaurios. Aparicion de Archaeopteryx.',                                201,145),
(5,'Cretacico',   'Diversificacion de angiospermas. Extincion masiva final de dinosaurios no aviares.',         145,66),
(6,'Paleogeno',   'Gran radiacion de mamiferos. Primeros primates.',                                             66,23),
(6,'Neogeno',     'Expansion de sabanas. Evolucion de hominidos.',                                               23,2),
(6,'Cuaternario', 'Glaciaciones ciclicas. Evolucion de Homo sapiens. Era actual.',                               2,0),
(3,'Ediacarico',  'Primeros organismos multicelulares macroscopicos.',                                          635,541),
(3,'Criogenico',  'Periodo de glaciaciones globales (Tierra bola de nieve).',                                   720,635),
(3,'Toniano',     'Ruptura del supercontinente Rodinia.',                                                       1000,720);
GO

INSERT INTO TAXONOMIA (reino, filo, clase, orden, familia, genero, especie) VALUES
('Animalia','Chordata','Reptilia','Saurischia','Tyrannosauridae','Tyrannosaurus','Tyrannosaurus rex'),
('Animalia','Chordata','Reptilia','Ornithischia','Hadrosauridae','Edmontosaurus','Edmontosaurus regalis'),
('Animalia','Chordata','Mammalia','Proboscidea','Elephantidae','Mammuthus','Mammuthus primigenius'),
('Animalia','Chordata','Actinopterygii','Pycnodontidae','Pycnodontidae','Pycnodus','Pycnodus platessoides'),
('Animalia','Mollusca','Cephalopoda','Ammonitida','Ammonitidae','Ammonites','Ammonites nodosus'),
('Animalia','Arthropoda','Trilobita','Phacopida','Phacopidae','Phacops','Phacops rana'),
('Plantae','Pteridophyta','Polypodiopsida','Polypodiales','Polypodiaceae','Polypodium','Polypodium vulgare'),
('Plantae','Cycadophyta','Cycadopsida','Cycadales','Cycadaceae','Cycas','Cycas circinalis'),
('Animalia','Chordata','Reptilia','Plesiosauria','Elasmosauridae','Elasmosaurus','Elasmosaurus platyurus'),
('Animalia','Chordata','Reptilia','Ichthyosauria','Ichthyosauridae','Ichthyosaurus','Ichthyosaurus communis'),
('Animalia','Echinodermata','Echinoidea','Cidaroida','Cidaridae','Cidaris','Cidaris cidaris'),
('Animalia','Mollusca','Bivalvia','Ostreida','Gryphaeidae','Gryphaea','Gryphaea arcuata'),
('Animalia','Chordata','Mammalia','Perissodactyla','Equidae','Hipparion','Hipparion gracile'),
('Fungi','Basidiomycota','Agaricomycetes','Polyporales','Polyporaceae','Polyporellus','Polyporellus brumalis'),
('Animalia','Arthropoda','Insecta','Blattodea','Blattidae','Archimylacris','Archimylacris eggintoni'),
('Animalia','Chordata','Reptilia','Crocodilia','Crocodylidae','Crocodylus','Crocodylus acutus');
GO

-- bcrypt (cost 10) — los cuatro usuarios seed comparten esta contraseña hasta que la cambies en producción.
-- Regenerar: cd backend && node scripts/gen-hash.js "TuContraseña"
DECLARE @h VARCHAR(255) = '$2b$10$DZkoJ5RmGc95lp23ALube.rRtqbW5jc6KZ5uulMo6hWK7yJPjaHoC';

INSERT INTO USUARIO (rol_id,nombre,apellido,email,password_hash,telefono,pais,profesion,centro_trabajo) VALUES
(1,'Admin',        'StoneWake', 'admin@stonewake.org',        @h,'+506 0000-0001','Costa Rica','Administración del sistema',      'StoneWake Museum'),
(2,'Investigador', 'Demo',      'investigador@stonewake.org', @h,'+506 0000-0002','Costa Rica','Investigación paleontológica',     'StoneWake Museum'),
(3,'Jaydanie',     'Morris',    'explorador@stonewake.org',   @h,'+506 0000-0003','Costa Rica','Registro de hallazgos en campo',   'StoneWake Museum'),
(2,'Miguel',       'Galvez',    'miguel@stonewake.org',       @h,'+506 0000-0004','Costa Rica','Investigacion y exploracion',       'StoneWake Museum');
GO

INSERT INTO USUARIO_ROL (usuario_id, rol_id)
SELECT u.id, u.rol_id
FROM USUARIO u
WHERE u.deleted_at IS NULL;
GO

INSERT INTO USUARIO_ROL (usuario_id, rol_id)
SELECT u.id, r.id
FROM USUARIO u
INNER JOIN ROL r ON r.nombre = 'explorador'
WHERE u.email = 'miguel@stonewake.org'
  AND u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM USUARIO_ROL ur
    WHERE ur.usuario_id = u.id AND ur.rol_id = r.id
  );
GO

/*
  FOSIL / MULTIMEDIA / estudios: sin datos de catálogo (cargar después con tus imágenes y scripts).
  Tras insertar fósiles e imágenes: cd backend && npm run apply:media-rules
*/

INSERT INTO CONTACTO (nombre,email,asunto,mensaje,leido,respondido) VALUES
('Visitante demo', 'visitante@ejemplo.local', 'Consulta general', 'Mensaje de prueba para el formulario de contacto.', 0, 0),
('Colegio demo',   'colegio@ejemplo.local',   'Visita educativa',  'Solicitud de información para una visita escolar.', 1, 0);
GO

SELECT 'ROL'          AS tabla, COUNT(*) AS registros FROM ROL               UNION ALL
SELECT 'PAIS',                  COUNT(*)              FROM PAIS              UNION ALL
SELECT 'PROVINCIA',             COUNT(*)              FROM PROVINCIA         UNION ALL
SELECT 'CANTON',                COUNT(*)              FROM CANTON            UNION ALL
SELECT 'CATEGORIA_FOSIL',       COUNT(*)              FROM CATEGORIA_FOSIL   UNION ALL
SELECT 'ERA_GEOLOGICA',         COUNT(*)              FROM ERA_GEOLOGICA      UNION ALL
SELECT 'PERIODO_GEOLOGICO',     COUNT(*)              FROM PERIODO_GEOLOGICO  UNION ALL
SELECT 'TAXONOMIA',             COUNT(*)              FROM TAXONOMIA          UNION ALL
SELECT 'USUARIO',               COUNT(*)              FROM USUARIO            UNION ALL
SELECT 'USUARIO_ROL',           COUNT(*)              FROM USUARIO_ROL        UNION ALL
SELECT 'FOSIL',                 COUNT(*)              FROM FOSIL              UNION ALL
SELECT 'MULTIMEDIA',            COUNT(*)              FROM MULTIMEDIA         UNION ALL
SELECT 'ESTUDIO_CIENTIFICO',    COUNT(*)              FROM ESTUDIO_CIENTIFICO UNION ALL
SELECT 'REFERENCIA_ESTUDIO',    COUNT(*)              FROM REFERENCIA_ESTUDIO UNION ALL
SELECT 'CONTACTO',              COUNT(*)              FROM CONTACTO
ORDER BY tabla;
GO






