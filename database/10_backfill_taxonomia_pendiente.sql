/*
  Rellena taxonomía mínima para fósiles existentes que no tienen taxonomia_id.
  - Crea una taxonomía "pendiente" por categoría (PAL/MIN/ROC/FOS)
  - Asigna taxonomia_id a FOSIL donde esté NULL
*/

SET NOCOUNT ON;

IF OBJECT_ID('tempdb..#TAXO_MAP') IS NOT NULL DROP TABLE #TAXO_MAP;
CREATE TABLE #TAXO_MAP (
  categoria_id INT PRIMARY KEY,
  reino VARCHAR(100),
  filo VARCHAR(100),
  clase VARCHAR(100),
  orden_tax VARCHAR(100),
  familia VARCHAR(100),
  genero VARCHAR(100),
  especie VARCHAR(200)
);

INSERT INTO #TAXO_MAP (categoria_id, reino, filo, clase, orden_tax, familia, genero, especie)
VALUES
  (4, 'Animalia', 'Chordata', 'Reptilia', 'Pendiente', 'Pendiente', 'Pendiente', 'sp.'),
  (2, 'Mineralia', 'Pendiente', 'Pendiente', 'Pendiente', 'Pendiente', 'Pendiente', 'sp.'),
  (3, 'Geologia', 'Sedimentaria', 'Pendiente', 'Pendiente', 'Pendiente', 'Pendiente', 'sp.'),
  (1, 'Animalia', 'Pendiente', 'Pendiente', 'Pendiente', 'Pendiente', 'Pendiente', 'sp.');

;WITH faltantes AS (
  SELECT f.id, f.categoria_id
  FROM FOSIL f
  WHERE f.deleted_at IS NULL
    AND f.taxonomia_id IS NULL
)
INSERT INTO TAXONOMIA (reino, filo, clase, orden, familia, genero, especie)
SELECT DISTINCT
  m.reino, m.filo, m.clase, m.orden_tax, m.familia, m.genero, m.especie
FROM faltantes x
JOIN #TAXO_MAP m ON m.categoria_id = x.categoria_id
WHERE NOT EXISTS (
  SELECT 1
  FROM TAXONOMIA t
  WHERE t.reino = m.reino
    AND t.filo = m.filo
    AND t.clase = m.clase
    AND t.orden = m.orden_tax
    AND t.familia = m.familia
    AND t.genero = m.genero
    AND t.especie = m.especie
);

UPDATE f
SET f.taxonomia_id = t.id,
    f.updated_at = GETDATE()
FROM FOSIL f
JOIN #TAXO_MAP m ON m.categoria_id = f.categoria_id
JOIN TAXONOMIA t
  ON t.reino = m.reino
 AND t.filo = m.filo
 AND t.clase = m.clase
 AND t.orden = m.orden_tax
 AND t.familia = m.familia
 AND t.genero = m.genero
 AND t.especie = m.especie
WHERE f.deleted_at IS NULL
  AND f.taxonomia_id IS NULL;

SELECT COUNT(*) AS fosiles_sin_taxonomia
FROM FOSIL
WHERE deleted_at IS NULL
  AND taxonomia_id IS NULL;
