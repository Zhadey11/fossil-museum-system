USE FosilesDB;
GO

INSERT INTO ROL (nombre, descripcion) VALUES
('administrador', 'Acceso completo al sistema. CRUD de fosiles, gestion de usuarios y aprobacion de registros.'),
('investigador',  'Acceso a informacion cientifica detallada. Puede crear estudios y colaborar.'),
('explorador',    'Puede registrar nuevos hallazgos en campo y editar solo sus propios registros.'),
('publico',       'Acceso de solo lectura a la informacion publica del catalogo.');
GO

-- Paises y jerarquia geografica (ids usados en cantones)
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
(4,'SJM','San Jose Montaña'),(5,'LIB','Liberia'),(5,'NIC','Nicoya'),
(5,'SCR','Santa Cruz'),(6,'PNC','Puntarenas Centro'),(6,'OSA','Osa'),
(7,'LMC','Limon Centro'),(7,'TAL','Talamanca'),(7,'MAT','Matina');
GO

-- Tipos de hallazgo (FOS, MIN, ROC, PAL)
INSERT INTO CATEGORIA_FOSIL (codigo, nombre, descripcion) VALUES
('FOS','Fosil General',           'Restos o trazas de organismos del pasado geologico no clasificados en categorias especificas.'),
('MIN','Mineral',                  'Sustancias inorganicas naturales con composicion quimica y estructura cristalina definida.'),
('ROC','Roca',                     'Material solido formado por uno o mas minerales, resultado de procesos geologicos naturales.'),
('PAL','Paleontologico Especifico','Fosiles con valor cientifico excepcional que requieren estudio paleontologico especializado.');
GO

-- Eras (Ma = millones de años; inicio > fin)
INSERT INTO ERA_GEOLOGICA (nombre, descripcion, ma_inicio, ma_fin) VALUES
('Hadeico',     'Periodo mas antiguo, antes de los primeros registros rocosos conocidos.',                               4600,4000),
('Arcaico',     'Primeras rocas estables. Aparicion de los primeros microorganismos procariontes.',                      4000,2500),
('Proterozoico','Primeros organismos eucariontes. Formacion de supercontinentes. Primeras glaciaciones globales.',       2500,541),
('Paleozoico',  'Gran diversificacion de la vida. Aparicion de vertebrados y plantas terrestres.',                       541,252),
('Mesozoico',   'Era de los dinosaurios. Aparicion de mamiferos y aves. Dominio de reptiles.',                          252,66),
('Cenozoico',   'Era actual. Diversificacion de mamiferos. Evolucion de primates hasta Homo sapiens.',                   66,0);
GO

-- Periodos ligados a era_id (3=Proterozoico, 4=Paleozoico, ...)
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

-- Clasificacion cientifica (FOSIL.taxonomia_id opcional)
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

-- Hash demo para login (sustituir por esquema real en produccion)
DECLARE @h VARCHAR(255) = 'pbkdf2_sha256$720000$dev$hash_placeholder';

INSERT INTO USUARIO (rol_id,nombre,apellido,email,password_hash,telefono,pais,profesion,centro_trabajo) VALUES
(1,'Carlos','Mendez Solano',     'admin@fosilesdb.net',   @h,'+506 8888-0001','Costa Rica','Administrador de Sistemas',  'Centro de Investigacion Geologica CIG'),
(1,'Maria', 'Quesada Vargas',    'admin2@fosilesdb.net',  @h,'+506 8888-0002','Costa Rica','Gestora de Base de Datos',    'Centro de Investigacion Geologica CIG'),
(2,'Jorge', 'Alvarado Campos',   'jalvarado@ucr.ac.cr',   @h,'+506 7777-0001','Costa Rica','Paleontologo',                'Universidad de Costa Rica'),
(2,'Ana',   'Fonseca Bermudez',  'afonseca@tec.ac.cr',    @h,'+506 7777-0002','Costa Rica','Geologa Investigadora',       'Instituto Tecnologico de Costa Rica'),
(2,'Luis',  'Mora Rodriguez',    'lmora@una.ac.cr',       @h,'+506 7777-0003','Costa Rica','Biologo Evolutivo',           'Universidad Nacional de Costa Rica'),
(2,'Sofia', 'Perez Gutierrez',   'sperez@up.edu.pa',      @h,'+507 6666-0001','Panama',    'Paleontologa Marina',         'Universidad de Panama'),
(2,'Marco', 'Urena Zamora',      'murena@ucr.ac.cr',      @h,'+506 7777-0004','Costa Rica','Geologo Estratigrafo',        'Universidad de Costa Rica'),
(2,'Elena', 'Castillo Porras',   'ecastillo@una.ac.cr',   @h,'+506 7777-0005','Costa Rica','Micropaleontologa',           'Universidad Nacional de Costa Rica'),
(3,'Andres','Jimenez Lopez',     'ajimenez@gmail.com',    @h,'+506 6666-0001','Costa Rica','Guia de Montana',             'Freelance'),
(3,'Karla', 'Sancho Herrera',    'ksancho@gmail.com',     @h,'+506 6666-0002','Costa Rica','Biologa de Campo',            'SINAC'),
(3,'Rodrigo','Vargas Chaves',    'rvargas@gmail.com',     @h,'+506 6666-0003','Costa Rica','Geologo Junior',              'Centro de Investigacion Geologica CIG'),
(3,'Valentina','Rojas Ulate',    'vrojas@gmail.com',      @h,'+506 6666-0004','Costa Rica','Estudiante Geologia',         'Universidad de Costa Rica'),
(3,'Pablo', 'Cespedes Mora',     'pcespedes@gmail.com',   @h,'+506 6666-0005','Costa Rica','Naturalista',                 'Museo Nacional de Costa Rica'),
(3,'Natalia','Esquivel Diaz',    'nesquivel@gmail.com',   @h,'+506 6666-0006','Costa Rica','Arqueologa',                  'UCR Escuela de Antropologia'),
(3,'Esteban','Mendez Arias',     'emendez@gmail.com',     @h,'+506 6666-0007','Costa Rica','Espeleologo',                 'Sociedad Espeleologica CR'),
(3,'Adriana','Morera Vega',      'amorera@gmail.com',     @h,'+506 6666-0008','Costa Rica','Botanica',                    'CIBIO UCR'),
(2,'Diana', 'Barrantes Rojas',   'dbarrantes@una.ac.cr',  @h,'+506 7777-0006','Costa Rica','Geoquimica',                  'Universidad Nacional de Costa Rica');
GO

-- Fichas vía SP (orden de insercion = ids 1,2,3...); luego taxonomia por codigo
DECLARE @id INT, @cod VARCHAR(30);

EXEC sp_registrar_fosil 10,4,5,9,9,'Diente de Mosasaurio del Valle de Turrialba','Diente conico bien preservado de un mosasaurio marino. Hallado en afloramientos de lutita calcarea del Cretacico Superior en las laderas del Valle de Turrialba.',9.9008,-83.6780,NULL,NULL,'2024-03-15',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 20,4,6,10,10,'Vertebra de Cetaceo Primitivo de Talamanca','Vertebra lumbar de cetaceo arqueoceto del Eoceno encontrada en sedimentos marinos expuestos por erosion costera en Talamanca.',9.5667,-82.8500,NULL,NULL,'2024-05-20',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 8,1,5,8,11,'Helecho Fosil de San Carlos','Impresion detallada de fronde de helecho arborescente del Jurasico Medio encontrada en capas de lutita carbonosa en la zona norte de San Carlos.',10.3167,-84.5167,NULL,NULL,'2024-01-10',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',2,NULL;

EXEC sp_registrar_fosil 15,2,4,4,12,'Cristal de Cuarzo Ahumado de Nicoya','Cristal de cuarzo ahumado de 12 cm de longitud encontrado en venas hidrotermales de roca granitica en la Peninsula de Nicoya.',10.1483,-85.4517,NULL,NULL,'2023-11-05',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 18,3,3,13,13,'Basalto con Pillow-Lava de la Peninsula de Osa','Muestra de basalto en estructura de pillow-lava proveniente del complejo ofiolitico de la Peninsula de Osa.',8.7167,-83.5833,NULL,NULL,'2024-02-28',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',2,NULL;

EXEC sp_registrar_fosil 7,4,6,11,14,'Molar de Mastodonte de Grecia','Molar superior de mastodonte americano del Plioceno encontrado en depositos aluviales del Rio Grande de Tarcoles a su paso por Grecia.',10.0700,-84.3167,NULL,NULL,'2024-09-12',@id OUTPUT,@cod OUTPUT;

EXEC sp_registrar_fosil 2,1,5,9,15,'Amonite del Canyon del Rio Virilla','Amonite de 8 cm de diametro con ornamentacion de costillas y tuberculos laterales. Hallado en las paredes de una cueva calcarea en el canon del Rio Virilla.',9.8833,-84.0500,NULL,NULL,'2024-06-30',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 12,2,4,3,16,'Pirita en Cubo de los Cerros de Heredia','Agregado cristalino de pirita en habito cubico perfecto encontrado en venas de cuarzo encajadas en esquistos metamorficos de los Cerros de la Carpintera.',9.9983,-84.1167,NULL,NULL,'2023-08-18',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',2,NULL;

EXEC sp_registrar_fosil 10,4,5,8,9,'Coral Tabular del Jurasico de Turrialba','Colonia de coral tabular del Jurasico Inferior con estructura hexagonal bien definida. Encontrada en afloramientos calcarios en las faldas del Volcan Turrialba.',10.0200,-83.7400,NULL,NULL,'2024-04-22',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 6,1,6,10,10,'Hoja Fosil Dicotiledonea de San Ramon','Impresion foliar de angiosperma dicotiledonea del Eoceno encontrada en capas de tobas volcanicas en los alrededores de San Ramon.',10.0900,-84.4717,NULL,NULL,'2024-07-14',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',2,NULL;

EXEC sp_registrar_fosil 14,3,5,9,11,'Caliza Bioclastica de Liberia','Muestra de caliza bioclastica del Cretacico con alta concentracion de fragmentos de rudistas, equinodermos y corales.',10.6333,-85.4333,NULL,NULL,'2024-03-08',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 21,4,6,11,12,'Fragmento de Maxilar de Crocodiliano de Matina','Fragmento de maxilar derecho con 4 alveolos dentarios de un crocodiliano del Mioceno hallado en arcillas lacustres de la llanura aluvial del Rio Matina.',10.0700,-83.3400,NULL,NULL,'2024-08-03',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'en_revision',2,'Se solicitan fotografias adicionales y analisis de composicion del esmalte.';

EXEC sp_registrar_fosil 9,1,4,1,13,'Trilobite Completo de las Canteras de Cartago','Especimen completo de trilobite del Cambrico Medio con cefaron, torax de 11 segmentos y pigidio conservados. Mineralizacion piritica preserva detalles del hipostoma.',9.8600,-83.9200,NULL,NULL,'2023-12-20',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 3,2,3,14,14,'Calcopirita Masiva de Puriscal','Masa de calcopirita con superficie de fractura mostrando tonos dorado-verdoso. Encontrada en venas polimetalicas de la zona minera de Puriscal.',9.8500,-84.3167,NULL,NULL,'2024-10-07',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',2,NULL;

EXEC sp_registrar_fosil 16,4,5,9,15,'Equinodermo Irregular del Cretacico de Santa Cruz','Erizo de mar irregular del Cretacico Superior con el test completo, aparato apical y peristoma visibles. Hallado en calizas de la Formacion Barco.',10.2667,-85.5833,NULL,NULL,'2024-11-19',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'publicado',1,NULL;

EXEC sp_registrar_fosil 1,1,6,12,16,'Posible Hueso de Megafauna Pleistocenica','Fragmento oseo de gran tamano encontrado en excavaciones para construccion en San Jose. Requiere analisis adicional para determinar si corresponde a megafauna pleistocenica.',9.9333,-84.0833,NULL,NULL,'2024-08-22',@id OUTPUT,@cod OUTPUT;
EXEC sp_cambiar_estado_fosil @id,'rechazado',1,'El especimen no presenta caracteristicas diagnosticas suficientes para una clasificacion confiable.';
GO

-- Enlaces taxonomicos por codigo generado
UPDATE FOSIL SET taxonomia_id = 9  WHERE codigo_unico LIKE 'CRI-CAR-TUR-PAL-00001';
UPDATE FOSIL SET taxonomia_id = 3  WHERE codigo_unico LIKE 'CRI-LIM-TAL-PAL-00001';
UPDATE FOSIL SET taxonomia_id = 7  WHERE codigo_unico LIKE 'CRI-ALA-SCA-FOS-00001';
UPDATE FOSIL SET taxonomia_id = 5  WHERE codigo_unico LIKE 'CRI-SJO-DES-FOS-00001';
UPDATE FOSIL SET taxonomia_id = 11 WHERE codigo_unico LIKE 'CRI-CAR-TUR-PAL-00002';
UPDATE FOSIL SET taxonomia_id = 8  WHERE codigo_unico LIKE 'CRI-ALA-SRM-FOS-00001';
UPDATE FOSIL SET taxonomia_id = 6  WHERE codigo_unico LIKE 'CRI-CAR-CAC-FOS-00001';
UPDATE FOSIL SET taxonomia_id = 11 WHERE codigo_unico LIKE 'CRI-GUA-SCR-PAL-00001';
GO

-- URLs de ejemplo (almacenamiento real en app/API)
INSERT INTO MULTIMEDIA (fosil_id,tipo,subtipo,url,nombre_archivo,angulo,descripcion,es_principal,orden)
SELECT f.id,'imagen','portada', '/media/fosiles/f' + CAST(f.id AS VARCHAR) + '/portada.webp',
    'portada.webp','frontal','Vista principal del especimen',1,1
FROM FOSIL f WHERE f.deleted_at IS NULL AND f.estado IN ('publicado','en_revision');

INSERT INTO MULTIMEDIA (fosil_id,tipo,subtipo,url,nombre_archivo,angulo,descripcion,es_principal,orden)
SELECT f.id,'imagen','antes','/media/fosiles/f' + CAST(f.id AS VARCHAR) + '/antes.webp',
    'antes.webp','campo','Estado al momento del hallazgo',0,2
FROM FOSIL f WHERE f.deleted_at IS NULL AND f.estado IN ('publicado','en_revision');

INSERT INTO MULTIMEDIA (fosil_id,tipo,subtipo,url,nombre_archivo,angulo,descripcion,es_principal,orden)
SELECT f.id,'imagen','despues','/media/fosiles/f' + CAST(f.id AS VARCHAR) + '/despues.webp',
    'despues.webp','lateral','Despues del proceso de limpieza',0,3
FROM FOSIL f WHERE f.deleted_at IS NULL AND f.estado = 'publicado';
GO

-- Estudios (fosil_id 1..N segun orden de registro arriba)
INSERT INTO ESTUDIO_CIENTIFICO (fosil_id,investigador_id,titulo,contexto_objetivo,tipo_analisis,resultados,composicion,condiciones_hallazgo,publicado)
VALUES
(1,3,'Analisis morfologico de diente de Mosasaurio de Turrialba',
 'Estudio del primer registro documentado de mosasaurio en sedimentos del Cretacico Superior en la zona Central del Caribe costarricense.',
 'Analisis morfometrico, SEM y XRF',
 'El diente presenta morfologia biconica diagnostica de Mosasaurus hoffmannii. XRF revela fluorapatita con trazas de fluoruro barico.',
 'Fluorapatita con 3 porciento de reemplazo por carbonato. Trazas de Fe, Mn y Ba.',
 'A 2.3 m de profundidad en lutita gris oscura. pH 6.8. Temperatura 24 grados.',1),

(2,4,'Cetaceos arqueocetos del Eoceno del Caribe Costarricense',
 'Descripcion del primer especimen de cetaceo primitivo del Eoceno de Costa Rica con analisis filogenetico dentro de Basilosauridae.',
 'CT scan, analisis filogenetico cladistico y datacion por bioestratigrafia de foraminieros',
 'Morfologia consistente con Basilosaurus o Dorudon. Bioestratigrafia ubica el hallazgo en el Eoceno Medio, 45 Ma. Primer registro nacional de Basilosauridae.',
 '60 porciento hidroxiapatita original y 40 porciento reemplazado por calcita esparitica.',
 'Acantilado costero a 8 m sobre el nivel del mar en estrato de lutita calcarea gris-azulada.',1),

(3,5,'Flora del Jurasico Medio de la Zona Norte de Costa Rica',
 'Documentacion de helechos arborescentes en la formacion volcano-sedimentaria de la Zona Norte como indicadores paleoclimaticos del Jurasico Medio.',
 'Analisis morfologico foliar, acetolisis y comparacion con flora jurasica referencial',
 'Caracteristicas de la familia Dipteridaceae. Afinidad con genero Hausmannia. Clima inferido tropical humedo con temperatura media de 26-28 grados.',
 'Carbono organico con indice de cristalinidad Rv 0.4 porciento indicando diagenesis inmadura.',
 'Superficie de estratificacion de lutita carbonosa. Preservacion como compresion-impresion.',1),

(7,3,'Amonites del Cretacico Inferior del Canon del Rio Virilla',
 'Estudio de fauna de amonoideos en una nueva localidad cretacica del canon del Virilla para bioestratigrafia local.',
 'Analisis morfometrico de la concha e identificacion de la sutura con escala Tethyan',
 'Especimen asignado a subfamilia Hoplitinae, biozona Douvilleiceras mammillatum del Albiano Inferior, 108-113 Ma.',
 'Concha de aragonita recristalizada a calcita. Relleno de camaras con calcita esparitica blanca.',
 'Cavidad de disolucion karstica activa. Humedad 85 porciento. Temperatura 20 grados.',1),

(13,3,'Trilobites del Cambrico de Costa Rica: Primer registro documentado',
 'Descripcion del primer especimen completo de trilobite confirmado del Cambrico en territorio costarricense.',
 'Analisis morfologico detallado, fotografia con luz rasante e imagen 3D por fotogrametria',
 'Pertenece al orden Ptychopariida. Morfologia consistente con generos gondwanicos. Sugiere conexion con plataforma de Gondwana en el Cambrico.',
 'Calcita original con 95 porciento de preservacion. Mineralizacion piritica secundaria en suturas.',
 'Lente calcareo de 30 cm en zona de contacto metamorfico. Temperatura estimada de metamorfismo: 200 grados.',1);
GO

-- Referencias por estudio_id (1..5 segun filas anteriores)
INSERT INTO REFERENCIA_ESTUDIO (estudio_id,titulo,url,tipo,autores,anio) VALUES
(1,'Mosasaur distribution in the Late Cretaceous of Central America','https://doi.org/10.1016/j.cretres.2019.104234','doi','Polcyn M.J., Bell G.L.',2019),
(1,'Geologia del Cretacico Superior de Turrialba','https://revistas.ucr.ac.cr/index.php/geologica/article/view/001','articulo','Denyer P., Arias O.',2020),
(1,'XRF Analysis Methods for Fossil Enamel','https://doi.org/10.1016/j.quageo.2019.100980','doi','Hassler A., Martin J.E.',2019),
(2,'Eocene cetaceans of the Caribbean','https://doi.org/10.1093/zoolinnean/zlac040','doi','Geisler J.H., Uhen M.D.',2022),
(2,'Bioestratigrafia del Eoceno de Costa Rica','https://revistas.ucr.ac.cr/index.php/geologica/article/view/002','articulo','Obando J.A.',2021),
(2,'Vertebrate Palaeontology of Costa Rica','https://revistas.ucr.ac.cr/index.php/biologica/article/view/003','articulo','Laurito C.A., Valerio A.L.',2023),
(3,'Jurassic floras of Central America','https://doi.org/10.1016/j.revpalbo.2018.02.011','doi','Ricardi-Branco F.',2018),
(3,'Atlas de Paleobotanica del Mesozoico','https://www.botanical.go.cr/publicaciones/atlas.pdf','libro','Gomez L., Herrera F.',2016),
(4,'Hoplitinae from the Lower Cretaceous of the Tethyan Realm','https://doi.org/10.1016/j.cretres.2020.104523','doi','Kennedy W.J., Gale A.S.',2020),
(4,'Mesozoic stratigraphy of the Caribbean slope of Costa Rica','https://doi.org/10.1144/jgs2021-123','doi','Meschede M., Frisch W.',2021),
(5,'Cambrian trilobites of Gondwana','https://doi.org/10.1144/SP503.10','doi','Waisfeld B., Vaccari N.E.',2021),
(5,'Lower Paleozoic of Central America: First Records','https://doi.org/10.1016/j.jsameth.2022.104890','doi','Ortega-Gutierrez F.',2022),
(5,'Mapa Geologico de Costa Rica Hoja Cartago','https://www.geologia.go.cr/mapas/cartago.pdf','informe','Servicio Nacional de Aguas',2022),
(1,'Manual de preparacion de fosiles vertebrados','https://www.museociencias.es/manual.pdf','libro','Gasco F., Narvez I.',2017),
(3,'Cambrian Fauna of the Pacific Realm','https://doi.org/10.1080/14772019.2020.1838879','doi','Zhang X., Shu D.',2020);
GO

-- Mensajes web de demostracion
INSERT INTO CONTACTO (nombre,email,asunto,mensaje,leido,respondido) VALUES
('Profesora Andrea Solano',    'asolano@escola.ed.cr',    'Visita educativa al museo digital',         'Soy docente de Ciencias y me gustaria organizar una actividad virtual con mi grupo de Biologia usando el catalogo.',1,1),
('Roberto Chaves Mora',        'rchaves@gmail.com',        'Hallazgo en Perez Zeledon',                 'Encontre un objeto que parece ser un fosil mientras hacia senderismo. Como puedo reportarlo oficialmente? Tengo fotos.',1,0),
('Museo Nacional de Panama',   'contacto@museopanama.gob.pa','Solicitud de colaboracion institucional', 'Estamos interesados en establecer un convenio de colaboracion e intercambio de datos sobre fosiles del Caribe.',1,1),
('Giovanna Picado',            'gpicado@ucr.ac.cr',        'Acceso para tesis doctoral',                'Soy estudiante del Doctorado en Geologia de la UCR. Mi investigacion es sobre paleobiogeografia del Cretacico. Como obtengo acceso?',0,0),
('Augusto Fernandez',          'augfg@yahoo.es',           'Error en descripcion del fosil',            'Al revisar la ficha del diente de mosasaurio, las coordenadas no corresponden con la ubicacion descrita. Favor verificar.',1,1),
('Colegio Cientifico Heredia', 'info@ccheredia.ed.cr',     'Permiso uso de imagenes',                   'Deseamos incorporar imagenes del catalogo en nuestra revista estudiantil de ciencias. Cuales son los terminos de uso?',0,0),
('William Aguilar',            'waguilar@petro.com',       'Consulta sobre patrimonio',                 'Nuestro equipo realiza prospeccion geologica en Guanacaste. Cual es el protocolo para reportar hallazgos fosiles?',1,0),
('Valentina Morales',          'vmorales@uned.ac.cr',      'Solicitud datos para investigacion',        'Soy investigadora de la UNED. Necesito acceder a datos de clasificacion taxonomica para comparar con registros del Pacifico Sur.',0,0),
('Carlos Seas Amador',         'cseas@itcr.ac.cr',         'Propuesta de mejora del sistema',           'El sistema es excelente. Sugiero agregar una linea de tiempo interactiva para visualizar fosiles por periodo geologico.',1,0),
('Ana Lucia Perez',            'alperez@gmail.com',        'Pregunta general sobre fosiles',            'Es normal encontrar fosiles en las playas del Pacifico? El mes pasado en Playa Hermosa encontre algo que parece un diente.',1,0),
('Prof. Marco Solano',         'msolano@unibe.ac.cr',      'Acceso institucional UNIBE',                'Soy director del Departamento de Biologia de UNIBE. Nos interesa incorporar el catalogo en nuestros cursos de Paleontologia.',0,0),
('Revista Geologia Tropical',  'editor@revgeo.ucr.ac.cr',  'Publicacion de hallazgos',                  'Estamos interesados en recibir articulos basados en los hallazgos documentados. Tienen investigadores interesados en publicar?',1,1),
('Ministerio de Educacion CR', 'dgec@mep.go.cr',           'Integracion con plataforma MEP',            'Exploramos recursos digitales de ciencias para secundaria. El catalogo es un excelente candidato para integrar a nuestros recursos.',1,0),
('Luisa Arrieta',              'larrietab@gmail.com',      'Foto que quiero compartir',                 'Encontre un fosil en Turrialba hace anos y tome muchas fotos. Hay manera de contribuir con imagenes aunque no sea investigadora?',0,0),
('Fundacion Neotropica',       'info@neotropica.org',      'Colaboracion en conservacion',              'Queremos explorar sinergias entre conservacion de patrimonio natural y el registro paleontologico. Podemos agendar reunion?',1,0);
GO

-- Resumen de conteos por tabla
SELECT 'ROL'               AS tabla, COUNT(*) AS registros FROM ROL                UNION ALL
SELECT 'PAIS',                        COUNT(*)             FROM PAIS               UNION ALL
SELECT 'PROVINCIA',                   COUNT(*)             FROM PROVINCIA          UNION ALL
SELECT 'CANTON',                      COUNT(*)             FROM CANTON             UNION ALL
SELECT 'CATEGORIA_FOSIL',             COUNT(*)             FROM CATEGORIA_FOSIL    UNION ALL
SELECT 'ERA_GEOLOGICA',               COUNT(*)             FROM ERA_GEOLOGICA      UNION ALL
SELECT 'PERIODO_GEOLOGICO',           COUNT(*)             FROM PERIODO_GEOLOGICO  UNION ALL
SELECT 'TAXONOMIA',                   COUNT(*)             FROM TAXONOMIA          UNION ALL
SELECT 'USUARIO',                     COUNT(*)             FROM USUARIO            UNION ALL
SELECT 'FOSIL',                       COUNT(*)             FROM FOSIL              UNION ALL
SELECT 'MULTIMEDIA',                  COUNT(*)             FROM MULTIMEDIA         UNION ALL
SELECT 'ESTUDIO_CIENTIFICO',          COUNT(*)             FROM ESTUDIO_CIENTIFICO UNION ALL
SELECT 'REFERENCIA_ESTUDIO',          COUNT(*)             FROM REFERENCIA_ESTUDIO UNION ALL
SELECT 'CONTACTO',                    COUNT(*)             FROM CONTACTO
ORDER BY tabla;
GO
