# Proposal — HU-01 Carga y Traducción de Oferta Académica en Excel

## Why

Hoy la universidad publica la oferta académica en planillas Excel/CSV heterogéneas y la comunidad la lee a mano, con errores y sin poder reutilizar los datos. El simulador de HU-02 funciona con datos de ejemplo; HU-01 entrega el traductor que convierte la planilla publicada en una oferta estructurada, validada y publicada, lista para que el simulador la consuma.

- Historia: **HU-01 — Carga y Traducción de Oferta Académica en Excel** (`04-historias-usuario.md`), ficha confirmada en `.cin324/historias/HU-01.md`.
- Actividad del TO-BE: **«Sincronizar y publicar oferta y referencias en el sistema»** (`02-rediseno-to-be.md`), tarea de usuario con apoyo del sistema. Respecto del AS-IS (`as-is.bpmn`: «Publica Excel de propuesta academica» y «Revisa la propuesta academica»), la lectura manual se sustituye por un procesador/traductor que extrae asignaturas, secciones y bloques horarios a una estructura web reutilizable. Solo se implementa la parte de **oferta**; **referencias** queda para HU-03.
- Casos de uso de origen: **CU-01 Cargar planilla, CU-02 Validar datos parseados, CU-03 Previsualizar datos y CU-04 Confirmar datos** (`09-casos-uso.md`), como un único flujo representado por **DSS-01** (`diagramas/dss_01.md`). Actor principal: Estudiante o administrador comunitario; sistema externo antecedente: Sistema de la Universidad (sin mensajes en el DSS).
- Requisitos que cubre: **RP-01** (carga y traducción a JSON) y **RP-02** (validación y mapeo de columnas).

## Relación con lo ya implementado

HU-01 es la fuente que faltaba para que las historias ya implementadas dejen de depender solo de datos de ejemplo. No las reemplaza ni cambia sus requisitos:

- **HU-02 Planificador:** la oferta publicada se convierte en la **oferta activa**; el planificador lista sus secciones y, al cambiar de oferta, retira de la simulación las secciones del período anterior. Se mantienen las reglas de choque y tope.
- **HU-03 Referencias:** se reutiliza `Asignatura` por código y se conserva el texto de `docente`; las evaluaciones existentes siguen asociadas y un docente nuevo muestra «Sin evaluaciones».
- **HU-04 Malla y HU-05 Tiempo restante:** HU-01 no modifica `carrera_asignatura`, `asignatura_prerrequisito` ni `asignatura_cursada`. Las asignaturas existentes conservan su `id`; las nuevas quedan en la oferta y el simulador, pero no se incorporan automáticamente a la malla.

## What Changes

- Pantalla de carga que acepta un archivo `.xlsx`/`.csv` **seleccionado o arrastrado**, con un selector de rol de demostración para «Estudiante o administrador comunitario».
- Parseo de cada fila como una sección de una asignatura: código, nombre, número de sección, docente, bloques horarios, créditos, cupos y semestre sugerido; el período se toma de la planilla y se mapea a `Oferta Académica.periodo`.
- Vista previa con el **mapeo de columnas** y el detalle de cada sección interpretada, antes de confirmar.
- Reporte de filas no interpretables con **número de fila y motivo** (sin código, sin bloques horarios, sección duplicada, crédito/cupo/semestre inválido). Confirmar la exclusión de esas filas cuenta como la acción `corregirMapeo` del EST-01.
- Corrección del mapeo de columnas con reprocesamiento y revalidación; si no queda ninguna sección válida, la oferta no se publica.
- Confirmación de la publicación: se guarda la oferta con `fechaPublicacion` fijada por el sistema, sus asignaturas, secciones y bloques horarios, y queda disponible como **oferta activa** del simulador de HU-02. Si el período ya está publicado, se informa y no se duplica.
- Integración con las historias existentes: se conserva el `id` de las asignaturas reutilizadas para no romper las evaluaciones de HU-03 ni la malla/avance de HU-04/HU-05; se retiran de la simulación las secciones de ofertas anteriores; no se modifica la malla ni el avance.
- Ciclo de vida de **Oferta Académica** según EST-01, hasta el estado `Publicada`. No se implementa la transición final de reemplazo del mismo período.
- Seis escenarios Gherkin (los dos originales precisados y cuatro nuevos) más dos escenarios de integración, con una prueba automática por escenario.

**Fuera de alcance:** la parte de «referencias» de la actividad del TO-BE (dificultad y valoración docente, HU-03); reemplazar una oferta ya publicada del mismo período (transición final de EST-01); simulación, choques y tope de créditos (HU-02); malla, prerrequisitos y tiempo restante (HU-04, HU-05); confirmar/exportar la simulación o inscripción formal (RP-08); **RP-09, por decisión del estudiante**, y los demás requisitos no funcionales (RP-10…RP-12); autenticación real; integración en vivo con la Universidad (sistema externo simulado como archivo de ejemplo).

## Capabilities

### New Capabilities

- `carga-oferta-academica`: carga, traducción, mapeo, validación, vista previa y publicación de la oferta académica procedente de una planilla Excel/CSV, con su ciclo de estados.

### Modified Capabilities

- `simulacion-horario`: no cambia su contrato; se integra la oferta activa publicada por HU-01 y se retiran de la simulación las secciones de ofertas anteriores. Las pruebas existentes de HU-02 deben seguir pasando.
- `referencias-comunitarias`, `malla-curricular` y `tiempo-restante`: sin cambios de requisitos. HU-01 conserva la identidad de `Asignatura` y no modifica evaluaciones, malla, prerrequisitos ni avance.

## Impact

- Código nuevo: `src/servicios/leerPlanilla.ts`, `src/servicios/parsearOferta.ts` y `src/servicios/publicarOferta.ts` (lectura, mapeo, validación y publicación), `src/dominio/estadoOferta.ts` (máquina de estados de EST-01), `src/rutas/carga.ts`, `src/vistas/carga.ejs` y sus parciales, y `tests/hu-01.test.ts`.
- Código compartido que se ajusta solo para integrar la oferta activa: `src/dominio/repositorios.ts` (`ofertaPublicadaActiva`, filtros por oferta), `src/servicios/simulacion.ts` (limpieza de selecciones de ofertas anteriores), `src/app.ts` (registro del router) y `src/vistas/parciales/cabecera.ejs` (enlace «Carga de oferta»).
- Se reutilizan las tablas derivadas del modelo de dominio ya creadas en `001_inicial.sql`: `oferta_academica`, `asignatura`, `seccion` y `bloque_horario`. No se crean tablas nuevas: la migración `004_estado_oferta.sql` agrega a `oferta_academica` las columnas `estado` (ciclo de EST-01) y `borrador` (JSON del mapeo y las filas en revisión). Créditos, cupos y semestre sugerido ya existen y ahora se toman de la planilla.
- El `seed` de la oferta 2026-2 se mantiene para las historias ya implementadas; la carga de HU-01 usa otro período en los ejemplos y pruebas para no duplicar `periodo UNIQUE`.
- `tests/db.test.ts` pasa a esperar **4** migraciones. La regresión incluye HU-02, HU-03, HU-04 y HU-05.
- **No se modifica** `src/db/migrations/003_malla.sql`, `src/dominio/malla.ts`, `src/dominio/tiempo-restante.ts`, `src/rutas/malla.ts` ni el seed de malla/avance de HU-04/HU-05.
- Dependencias nuevas: `multer` (recepción multipart del archivo), `exceljs` (lectura de `.xlsx`) y `csv-parse` (lectura de `.csv`); se instalan junto con el resto del stack ya configurado.
- Sin sistemas externos con mensajes: el Sistema de la Universidad se simula como un archivo de planilla de ejemplo.
- Documentación: `README.md` con el nuevo recorrido de carga, la oferta activa y los comandos de ejecución/pruebas.
