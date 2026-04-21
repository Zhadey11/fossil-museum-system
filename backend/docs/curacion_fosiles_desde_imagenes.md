# Curación de fósiles desde imágenes (plantilla de trabajo)

Usá este documento para investigar y completar datos correctos por fósil.
Cuando lo llenes, me lo pasás y yo actualizo la BD.

## Campos mínimos por fósil (para pasarme)

- `fosil_id`
- `nombre_correcto`
- `categoria_codigo` (`PAL`, `MIN`, `ROC`, `FOS`)
- `era_id`
- `periodo_id`
- `descripcion_general`
- `descripcion_ubicacion`
- `fecha_hallazgo` (`YYYY-MM-DD`)
- `latitud` / `longitud` (si aplica)
- `estado` (`publicado` o `pendiente`)

## Campos por imagen (multimedia)

- `multimedia_id`
- `nombre_archivo_correcto` (solo DB, no mueve archivo físico)
- `subtipo` (`portada`, `antes`, `despues`, `general`, `analisis`, `escaneo`)
- `descripcion`
- `es_principal` (`1` solo para la portada del fósil)

---

## Lista rápida para investigar (nombres por carpeta de imágenes)

> Esta sección es para que busqués info por nombre de archivo.
> Es la lista actual registrada en BD (`MULTIMEDIA.url`), agrupada por carpeta.

### `/images/fossiles/paleontologico-especifico/` (10)

- `Cleoniceras_ammonites_corte.jpg`
- `Excavacion_ammonites_hallazgo.avif`
- `Tyrannosaurus_rex_excavacion_equipo.jpg`
- `Tyrannosaurus_rex_excavacion_sitio.jpg`
- `Excavacion_theropoda_herramientas.jpg`
- `Excavacion_sauropodo_campo.jpg`
- `Excavacion_sauropodo_vertebras.jpg`
- `Stegosaurus_fosil_excavacion.avif`
- `Tyrannosaurus_rex_excavacion_craneo.jpg`
- `Theropoda_fosil_arena.jpg`

### `/images/fossiles/generales/` (11)

- `Ichthyosaurus_communis.jpg`
- `Stegosaurus_ungulatus.avif`
- `Irritator_challengeri.jpg`
- `Smilodon_fatalis_craneo.jpg`
- `Tyrannosaurus_rex_craneo.jpg`
- `Tyrannosaurus_rex_esqueleto.jpg`
- `Smilodon_californicus.jpg`
- `Psittacosaurus_mongoliensis.jpg`
- `Stegosaurus_ungulatus_exhibicion.jpg`
- `Smilodon_fatalis_craneo__f6_m42.jpg`
- `Diplodocus_longus.jpg`

### `/images/fossiles/mineralizados/` (12)

- `Diplomystus_pez_fosil.jpg`
- `Pecten_bivalvo_fosil.jpg`
- `Ammonites_seccion_transversal.jpg`
- `Hippocampus_fosil_roca.jpg`
- `Perisphinctes_ammonites.jpg`
- `Ammonites_molde_interno.jpg`
- `Iguanodon_fosil_roca.jpg`
- `Protorosaurus_reptil_fosil.jpg`
- `Protorosaurus_reptil_fosil__f12_m43.jpg`
- `Cryptolithus_trilobita.jpg`
- `Elrathia_trilobita.jpg`
- `Neuropteris_helecho_fosil.jpg`

### `/images/fossiles/rocas/` (10)

- `Magnetita_roca_mineral.jpg`
- `Sinornithosaurus_dinosaurio_emplumado.jpg`
- `Pecopteris_helecho_carbonifero.jpg`
- `Zamites_fronda_fosil_roca.jpg`
- `Ammonites_grupo_roca_arenisca.jpg`
- `Trilobita_colonia_fosil_roca.webp`
- `Crinoidea_tallo_fosil_roca.jpg`
- `Scipionyx_samniticus_fosil_roca.jpg`
- `Caliza_fosilifera_multiple_organismos.jpg`
- `Ammonites_multiples_roca_gris.jpg`

---

## Inventario actual por categoría

### FOS

- `fosil_id: 17` — `Pueba` — estado: `publicado`
  - (sin imágenes asociadas)

### MIN

- `fosil_id: 4` — `Cristal de cuarzo ahumado`
  - `multimedia_id: 14` — `Cleoniceras_ammonites_corte.jpg`
  - `multimedia_id: 15` — `Diplomystus_pez_fosil.jpg`

- `fosil_id: 8` — `Agregado cristalino de pirita en cubo`
  - `multimedia_id: 16` — `Pecten_bivalvo_fosil.jpg`
  - `multimedia_id: 17` — `Ammonites_seccion_transversal.jpg`
  - `multimedia_id: 41` — `Magnetita_roca_mineral.jpg`

- `fosil_id: 14` — `Masa mineral de calcopirita`
  - `multimedia_id: 18` — `Hippocampus_fosil_roca.jpg`
  - `multimedia_id: 19` — `Sinornithosaurus_dinosaurio_emplumado.jpg`

### PAL

- `fosil_id: 1` — `Diente fósil de mosasaurio marino`
  - `multimedia_id: 1` — `Excavacion_ammonites_hallazgo.avif`
  - `multimedia_id: 2` — `Tyrannosaurus_rex_excavacion_equipo.jpg`
  - `multimedia_id: 30` — `Ichthyosaurus_communis.jpg`

- `fosil_id: 2` — `Vértebra fósil de cetáceo arcaico`
  - `multimedia_id: 3` — `Tyrannosaurus_rex_excavacion_sitio.jpg`
  - `multimedia_id: 4` — `Excavacion_theropoda_herramientas.jpg`

- `fosil_id: 3` — `Fronda fósil de helecho arborescente`
  - `multimedia_id: 8` — `Excavacion_sauropodo_campo.jpg`
  - `multimedia_id: 9` — `Diplodocus_longus.jpg`
  - `multimedia_id: 35` — `Excavacion_sauropodo_vertebras.jpg`
  - `multimedia_id: 36` — `Pecopteris_helecho_carbonifero.jpg`
  - `multimedia_id: 37` — `Zamites_fronda_fosil_roca.jpg`

- `fosil_id: 6` — `Molar fósil de mastodonte americano`
  - `multimedia_id: 42` — `Smilodon_fatalis_craneo__f6_m42.jpg`

- `fosil_id: 7` — `Concha fósil de amonite`
  - `multimedia_id: 10` — `Perisphinctes_ammonites.jpg`
  - `multimedia_id: 11` — `Ammonites_molde_interno.jpg`
  - `multimedia_id: 31` — `Iguanodon_fosil_roca.jpg`
  - `multimedia_id: 32` — `Ammonites_grupo_roca_arenisca.jpg`

- `fosil_id: 9` — `Colonia fósil de coral tabular`
  - `multimedia_id: 5` — `Stegosaurus_ungulatus.avif`
  - `multimedia_id: 33` — `Protorosaurus_reptil_fosil.jpg`
  - `multimedia_id: 34` — `Stegosaurus_fosil_excavacion.avif`

- `fosil_id: 10` — `Impresión fósil de hoja dicotiledónea`
  - `multimedia_id: 12` — `Irritator_challengeri.jpg`
  - `multimedia_id: 13` — `Smilodon_fatalis_craneo.jpg`
  - `multimedia_id: 26` — `Tyrannosaurus_rex_craneo.jpg`
  - `multimedia_id: 27` — `Tyrannosaurus_rex_esqueleto.jpg`
  - `multimedia_id: 28` — `Smilodon_californicus.jpg`
  - `multimedia_id: 29` — `Tyrannosaurus_rex_excavacion_craneo.jpg`

- `fosil_id: 12` — `Fragmento fósil de maxilar de crocodiliano`
  - `multimedia_id: 43` — `Protorosaurus_reptil_fosil__f12_m43.jpg`

- `fosil_id: 13` — `Ejemplar fósil de trilobite completo`
  - `multimedia_id: 24` — `Cryptolithus_trilobita.jpg`
  - `multimedia_id: 25` — `Elrathia_trilobita.jpg`
  - `multimedia_id: 40` — `Trilobita_colonia_fosil_roca.webp`

- `fosil_id: 15` — `Test fósil de equinodermo irregular`
  - `multimedia_id: 6` — `Psittacosaurus_mongoliensis.jpg`
  - `multimedia_id: 7` — `Stegosaurus_ungulatus_exhibicion.jpg`

- `fosil_id: 16` — `Fragmento óseo posible de megafauna` — estado: `rechazado`
  - `multimedia_id: 38` — `Crinoidea_tallo_fosil_roca.jpg`

### ROC

- `fosil_id: 5` — `Muestra de basalto con estructura pillow-lava`
  - `multimedia_id: 20` — `Theropoda_fosil_arena.jpg`
  - `multimedia_id: 21` — `Neuropteris_helecho_fosil.jpg`
  - `multimedia_id: 39` — `Scipionyx_samniticus_fosil_roca.jpg`

- `fosil_id: 11` — `Roca caliza bioclástica con fósiles`
  - `multimedia_id: 22` — `Caliza_fosilifera_multiple_organismos.jpg`
  - `multimedia_id: 23` — `Ammonites_multiples_roca_gris.jpg`

---

## Cómo me lo pasás en chat (formato sugerido)

```txt
fosil_id: 10
nombre_correcto: ...
categoria_codigo: PAL
era_id: ...
periodo_id: ...
descripcion_general: ...
descripcion_ubicacion: ...
fecha_hallazgo: YYYY-MM-DD
latitud: ...
longitud: ...
estado: publicado

multimedia:
- multimedia_id: 12
  nombre_archivo_correcto: ...
  subtipo: portada
  descripcion: ...
  es_principal: 1
- multimedia_id: 13
  nombre_archivo_correcto: ...
  subtipo: antes
  descripcion: ...
  es_principal: 0
```

