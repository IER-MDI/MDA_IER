# Design — HU-01 Carga y Traducción de Oferta Académica en Excel

## Context

Ver `proposal.md` para el porqué y `specs/carga-oferta-academica/spec.md` para el contrato de comportamiento. El repositorio ya tiene la aplicación de HU-02, HU-03, HU-04 y HU-05: Express + EJS, `better-sqlite3`, migraciones `001_inicial.sql`, `002_evaluaciones.sql` y `003_malla.sql`, `seed` idempotente con la oferta 2026-2, malla de 13 asignaturas, 7 prerrequisitos y avance demo, y tablas `oferta_academica`, `asignatura`, `seccion`, `bloque_horario`, `evaluacion`, `carrera_asignatura`, `asignatura_prerrequisito` y `asignatura_cursada`. La ficha confirmada está en `.cin324/historias/HU-01.md`.

EST-01 define un ciclo de vida para **Oferta Académica**, pero hoy esa tabla no tiene columna `estado`. DSS-01 está disponible como Mermaid en `diagramas/dss_01.md` (el `.puml` referenciado no existe). La Universidad es sistema externo **antecedente**: publica la planilla, pero no intercambia mensajes en el DSS.

La integración con lo ya implementado es parte del diseño: HU-01 publica la oferta que consume HU-02, conserva la identidad de `Asignatura` que usan HU-03/HU-04/HU-05 y no modifica la malla ni el avance.

## Goals / Non-Goals

**Goals:**
- Persistir el ciclo de EST-01 y los datos en revisión entre peticiones HTTP, con una sola función de transiciones.
- Parsear `.xlsx` y `.csv` a las entidades ya existentes del modelo de dominio, sin crear clases nuevas.
- Mostrar vista previa con mapeo editable y reporte de filas inválidas, y publicar solo cuando haya al menos una sección válida.
- Hacer que el simulador consuma la última oferta publicada, manteniendo el `seed` 2026-2 como dato de ejemplo.
- Integrar la oferta publicada con HU-02, HU-03, HU-04 y HU-05 sin cambiar sus requisitos: oferta activa, identidad de asignatura, métricas por docente y malla/avance compartidos.
- Cubrir los seis escenarios Gherkin, las dos variantes y los dos escenarios de integración con pruebas automáticas.

**Non-Goals:**
- Reemplazar una oferta ya publicada del mismo período (transición final de EST-01).
- Modificar los datos de evaluaciones, la grilla ni las reglas de choque/tope de HU-02 y HU-03.
- Agregar o quitar asignaturas de `carrera_asignatura`, prerrequisitos o avance curricular; modificar el código de HU-04/HU-05.
- Descontar cupos o realizar la inscripción formal (RP-08).
- Autenticación real, control de concurrencia y requisitos no funcionales (RP-09 queda fuera por decisión del estudiante).
- Integración en vivo con la Universidad: se simula con un archivo de ejemplo.

## Decisions

### Integración con las historias existentes

| Historia | Contrato de integración | Implementación en HU-01 | Prueba |
|----------|-------------------------|-------------------------|--------|
| HU-02 Planificador | Consume la oferta activa y sus secciones; no mezcla períodos. | `ofertaPublicadaActiva(db)`; `listarSeccionesDisponibles` filtra por la oferta activa; al publicar se limpian las selecciones de ofertas anteriores. | Publicar 2026-3 y verificar que el planificador muestra solo sus secciones y que la simulación quedó vacía. |
| HU-03 Referencias | Asocia evaluaciones por `asignatura_id` + texto de `docente`. | Upsert de `Asignatura` por `codigo` conservando el `id`; el docente se recorta y se colapsan espacios, sin cambiar el nombre. | MAT101 con «Prof. Ana Pérez» conserva 4,0/4,3; un docente nuevo muestra «Sin evaluaciones». |
| HU-04 Malla | Lee `asignatura`, `carrera_asignatura` y `asignatura_prerrequisito`. | Crea o actualiza `asignatura`; no toca las tablas de malla ni prerrequisitos. | La malla sigue con 13 asignaturas y 7 prerrequisitos; un código nuevo no aparece. |
| HU-05 Tiempo restante | Lee la malla, los prerrequisitos y `asignatura_cursada`. | Publica la oferta sin modificar el avance ni las relaciones curriculares. | El mínimo sigue en 4 semestres y el avance no cambia. |
| Navegación | `src/vistas/parciales/cabecera.ejs`. | Agrega el enlace «Carga de oferta». | `GET /planificador` contiene el enlace a `/carga`; `GET /carga` responde 200. |

**Reglas de integración:**

- **Oferta activa única.** `ofertaPublicadaActiva(db)` devuelve la última oferta con `estado = 'Publicada'`, ordenada por `fecha_publicacion` e `id` descendente. El `seed` 2026-2 es la activa mientras no se publique otra.
- **Cambio de oferta sin mezclar períodos.** En la misma transacción de publicación se eliminan de `simulacion_seccion` las filas cuyas secciones pertenecen a ofertas anteriores. La simulación conserva `nombre` y `estado`, pero queda sin secciones. Además, las consultas de secciones incluidas y créditos se filtran por la oferta activa como defensa.
- **Identidad de Asignatura.** `asignatura.codigo` es la clave. Si existe, se conserva su `id` y se actualizan `nombre`, `creditos` y `semestre_sugerido`; si no existe, se crea. Esto evita romper `evaluacion.asignatura_id`, `carrera_asignatura` y `asignatura_cursada`.
- **Malla curada.** HU-01 no inserta ni elimina filas de `carrera_asignatura` ni de `asignatura_prerrequisito`. Una asignatura nueva queda en la oferta y el simulador, pero no aparece en HU-04/HU-05 hasta un cambio de datos posterior.
- **Evaluaciones.** No se crean ni modifican. La coincidencia de HU-03 es exacta por `asignatura_id` y `docente`; el parseo solo normaliza espacios.
- **Cupos.** Se guardan en `seccion.cupos`; HU-02 no los descuenta porque la inscripción formal está fuera de alcance.

### Persistencia del ciclo y del borrador
La migración `004_estado_oferta.sql` agrega a `oferta_academica`:
- `estado TEXT NOT NULL DEFAULT 'Publicada'` con `CHECK` sobre los estados de EST-01: `Archivo recibido`, `Mapeo en revisión`, `Mapeo confirmado`, `Con inconsistencias`, `Estructurada`, `Publicada`, `Rechazada`. Las filas sembradas quedan como `Publicada`.
- `borrador TEXT` (nullable): JSON con `{ mapeo, filas, errores }` mientras la oferta está en revisión.

Una carga crea la fila de oferta en `Archivo recibido` con `periodo` leído de la planilla y `fecha_publicacion` provisional `''`; las secciones no se insertan hasta la publicación. `Rechazada` y la cancelación eliminan la fila. `src/dominio/estadoOferta.ts` expone **una sola función** `aplicarTransicion(estado, evento, guarda)` que valida que el evento sea permitido desde el estado actual, evalúa la guarda, ejecuta la acción y devuelve el nuevo estado; una transición inválida lanza un error con mensaje claro.

*Alternativa descartada:* una tabla `carga_oferta` separada, o mantener el estado solo en memoria de sesión. La primera duplicaría el estado de la misma clase; la segunda perdería el avance al reiniciar y rompería la trazabilidad con EST-01.

### Tablas derivadas del modelo de dominio
| Clase del modelo | Tabla | Uso en HU-01 |
|------------------|-------|--------------|
| Oferta Académica | `oferta_academica` | `periodo` de la planilla; `fecha_publicacion` fijada por el sistema al publicar; `estado` y `borrador` nuevos |
| Asignatura | `asignatura` | `codigo` (clave de reutilización), `nombre`, `creditos`, `semestre_sugerido` desde la planilla |
| Sección | `seccion` | `numero`, `docente`, `cupos` desde la planilla; `oferta_id` y `asignatura_id` por asociación |
| Sección (`horario`) | `bloque_horario` | una fila por bloque `dia`, `hora_inicio`, `hora_fin` |

- `Asignatura.codigo` es `UNIQUE`: si el código ya existe, se conserva su `id` y se actualizan `nombre`, `creditos` y `semestre_sugerido`; no se crea una asignatura duplicada. El `id` preservado mantiene asociadas las evaluaciones de HU-03, la malla de HU-04 y el avance de HU-05.
- `UNIQUE (oferta_id, asignatura_id, numero)` se respeta detectando duplicados en el parseo y reportándolos con motivo «sección duplicada», descartando la segunda fila.
- No se insertan ni eliminan filas de `carrera_asignatura` ni de `asignatura_prerrequisito`; una asignatura nueva no se incorpora automáticamente a la malla.
- Composición `Oferta 1 – 1..* Sección`: al publicar se exige al menos una sección válida; si no la hay, se informa «sin secciones válidas» y no se publica (no se viola la multiplicidad mínima).
- No se crea clase `Bloque` ni `Docente`: los bloques siguen siendo el atributo `horario` de Sección, representado como filas de `bloque_horario`, igual que en HU-02.

### Recepción, parseo y mapeo
- `multer` con `memoryStorage` recibe el archivo (límite 5 MB); el `<input type="file">` acepta `.xlsx,.csv` y el formulario admite arrastrar el archivo (un script mínimo asigna el `files` al input).
- `exceljs` lee la primera hoja del `.xlsx`; `csv-parse` lee el `.csv` con delimitador `,` o `;`. Un adaptador `leerPlanilla(archivo)` devuelve filas como texto, de modo que la lógica de parseo no depende de la librería.
- Mapeo por nombre de columna con valores por defecto: `periodo`, `codigo`, `nombre`, `numero`, `docente`, `bloques`, `creditos`, `cupos`, `semestreSugerido`. El usuario puede corregir la correspondencia y se reprocesa desde cero.
- Formato de bloques en una celda: `lunes 08:30-09:50; miercoles 08:30-09:50` → se divide en bloques. Se validan días del arreglo `DIAS` de `src/dominio/tipos.ts`, horas `HH:MM` con `inicio < fin`, créditos `> 0`, cupos `>= 0` y semestre entero `>= 1`.
- El texto de `docente` se recorta y se colapsan espacios internos; no se cambia el nombre. Así la coincidencia exacta de HU-03 (`asignatura_id` + `docente`) no se rompe por espacios accidentales.
- Cada fila inválida se reporta con **número de fila y motivo**: sin código, sin bloques horarios, sección duplicada, o crédito/cupo/semestre inválido. Confirmar la exclusión de esas filas se registra como evento `corregirMapeo` (EST-01).

*Alternativa descartada:* guardar `horario` como texto libre en `seccion`; impediría comparar intervalos en el simulador y ya fue descartada en HU-02.

### Rutas derivadas de DSS-01
| Método y ruta | Mensaje del DSS | Acción |
|---------------|-----------------|--------|
| `GET /carga` | solicitar archivo | Formulario de carga con selector de rol de demostración (Estudiante / Administrador comunitario) y enlace a la planilla de ejemplo |
| `POST /carga/archivo` | Cargar archivo Excel o CSV | Valida formato, registra la oferta, lee y extrae datos, detecta columnas; muestra vista previa + mapeo |
| `POST /carga/:id/mapeo` | Corregir columnas o datos | Guarda el mapeo corregido, reprocesa y revalida en `loop`; actualiza la vista previa |
| `POST /carga/:id/excluir` | Corregir columnas o datos | Confirma la exclusión de filas inválidas (equivalente a `corregirMapeo`) |
| `POST /carga/:id/confirmar` | Confirmar oferta académica | Valida, estructura y guarda asignaturas/secciones/bloques; fija `fecha_publicacion`; notifica «oferta disponible en simulador» |
| `POST /carga/:id/cancelar` | Usuario cancela | Elimina el borrador; no publica |

Mensajes en español: «Formato no admitido: use .xlsx o .csv», «Filas sin incorporar: fila N — <motivo>», «Sin secciones válidas: no se publicó la oferta», «La oferta 2026-3 ya está publicada», «Oferta publicada y disponible en el simulador». El id de la carga viaja en la URL (demostración sin sesiones reales).

### Sistema externo simulado
El **Sistema de la Universidad** no envía mensajes en DSS-01: se simula con un archivo `datos/ejemplo-oferta-2026-3.csv` (planilla de ejemplo descargable desde la pantalla de carga). No hay adaptador con llamadas de red; se documenta en la guía de pruebas.

### Navegación y rol de demostración
La cabecera compartida agrega el enlace «Carga de oferta» y la opción «Administrador comunitario» al selector de rol. La etiqueta del rol se calcula en `cabecera.ejs` a partir de la cookie `rol`, de modo que las pantallas existentes no necesitan cambiar su lógica. `POST /rol` acepta `estudiante` o `administrador`; cualquier otro valor se normaliza a `estudiante`. No hay autenticación real.

### Oferta activa del simulador y continuidad de la simulación
`ofertaPublicadaActiva(db)` devuelve la última oferta con `estado = 'Publicada'`, ordenada por `fecha_publicacion` e `id` descendente. `listarSeccionesDisponibles` filtra sus secciones por ese `oferta_id`; `listarSeccionesDeSimulacion` y `calcularCreditos` también se limitan a la oferta activa para no mezclar períodos.

Al publicar una oferta nueva, `publicarOferta` elimina de `simulacion_seccion` las filas cuyas secciones pertenecen a ofertas anteriores, dentro de la misma transacción. La simulación conserva su nombre y estado, pero queda vacía para que el estudiante la arme con la oferta vigente. Sin una carga nueva, la activa es la 2026-2 del `seed`, así que las pruebas de HU-02/HU-03 siguen igual; al publicar 2026-3, el planificador muestra esa oferta y el total de créditos vuelve a 0. No cambia ningún requisito de `simulacion-horario`.

*Alternativa descartada:* mostrar secciones de todas las ofertas publicadas; mezclaría períodos distintos en una misma grilla.

*Alternativa descartada:* conservar las selecciones de la oferta anterior; dejarían una simulación con secciones que ya no se ofrecen y créditos de otro período.

### Pruebas
`tests/hu-01.test.ts` usa Vitest + supertest sobre `app.ts` con base SQLite en memoria y `seed`. Una prueba por escenario Gherkin (seis), más dos para las variantes confirmadas (período ya publicado y sin secciones válidas). Cada prueba genera una planilla CSV en memoria, la envía por multipart con `.attach()`, y verifica **el estado persistido** (`oferta_academica.estado`, filas de `seccion`/`bloque_horario`, y ausencia de publicación en los casos de error), no solo el HTML.

`tests/integracion-hu-01.test.ts` verifica los dos escenarios de integración y el contrato con las historias existentes:

- publicar 2026-3 activa esa oferta, retira de la simulación la sección de 2026-2 y deja el total de créditos en 0;
- las evaluaciones de MAT101 / Prof. Ana Pérez siguen visibles con 4,0 y 4,3; un docente nuevo muestra «Sin evaluaciones»;
- la malla sigue con 13 asignaturas y 7 prerrequisitos, el avance no cambia y el mínimo de HU-05 sigue en 4 semestres;
- una asignatura nueva aparece en el simulador pero no en la malla;
- `tests/db.test.ts` espera 4 migraciones y la regresión completa de HU-02, HU-03, HU-04 y HU-05 pasa sin cambios.

## Risks / Trade-offs

- **Instalación de dependencias sin red o con binario nativo incompatible** → mitigación: `multer`/`exceljs`/`csv-parse` se instalan con `npm install`; si falla, se documenta el error con claridad y se evalúa un adaptador con parser CSV propio y lectura mínima del XML interno del `.xlsx` usando `node:zlib`, sin cambiar el contrato de la spec.
- **Planillas XLSX heterogéneas** → mitigación: mapeo de columnas editable y validación fila por fila; se procesa solo la primera hoja y se documenta la limitación.
- **`periodo` es `UNIQUE` y el `seed` ya cargó 2026-2** → mitigación: los ejemplos y pruebas usan 2026-3; cargar 2026-2 informa «ya publicada» y no duplica.
- **`fecha_publicacion` provisional en borradores** → mitigación: el simulador filtra por `estado = 'Publicada'`, así que un borrador nunca aparece como oferta activa.
- **Cambio de oferta y simulación** → mitigación: al publicar se retiran las selecciones de ofertas anteriores y se informa que la simulación quedó vacía; es preferible a mezclar períodos. Se prueba con la oferta 2026-3.
- **Asignaturas nuevas fuera de la malla** → mitigación: se documenta que la malla es curada; HU-01 no inserta `carrera_asignatura` ni prerrequisitos. Una asignatura nueva se ofrece en el simulador, pero no altera HU-04/HU-05.
- **Actualización de metadatos de asignaturas existentes** → mitigación: se conserva el `id` y se actualizan solo `nombre`, `creditos` y `semestre_sugerido`; la planilla es la fuente oficial. Las evaluaciones, la malla y el avance siguen asociados.
- **Coincidencia de docente para HU-03** → mitigación: se recorta y colapsa espacios, y se prueba con el docente existente y con uno nuevo; no se inventan métricas.
- **Borrador JSON y límite de archivo** → mitigación: `multer` con límite de 5 MB y validación temprana de formato.
- **Sin sesiones reales** → mitigación: selector de rol de demostración e id de carga en la URL, aceptable para el taller; no protege datos.

## Migration Plan

1. `npm install` agrega `multer`, `exceljs` y `csv-parse` y actualiza `package-lock.json`.
2. Al arrancar la aplicación, `crearBase()` aplica `004_estado_oferta.sql` automáticamente y la registra en `schema_migrations`; las filas existentes quedan con `estado = 'Publicada'` y `003_malla.sql` no se modifica.
3. `npm run db:seed` sigue siendo idempotente y no crea ofertas duplicadas.
4. `tests/db.test.ts` pasa a esperar 4 migraciones; `npm test` ejecuta la regresión de HU-02, HU-03, HU-04 y HU-05.
5. No hay rollback automático de esquema: si se necesita volver atrás, se restaura el archivo `data/app.db` desde una copia (o se elimina para regenerarlo con `npm run db:seed`).

## Open Questions

Ninguna: las decisiones de alcance, actores, atributos, estados y flujo fueron confirmadas por el estudiante el 2026-11-22.
