# Proposal

## Why

La HU-03 permite al estudiante consultar la valoración comunitaria de los docentes y la dificultad percibida de las asignaturas mientras arma su horario, para decidir con información y no a ciegas. Hoy el planificador de HU-02 solo muestra secciones, bloques y créditos; faltan las métricas que el estudiante necesita para elegir entre alternativas.

## What Changes

- Agregar la tabla `evaluacion` con `asignatura_id`, `docente`, `calificacion_docente`, `dificultad_percibida` y `comentario`; **sin** vínculo con el estudiante, para preservar el anonimato.
- Cargar evaluaciones de ejemplo de forma idempotente: tres para MAT101 / Prof. Ana Pérez con pares (docente, dificultad) = (5,4), (3,4), (4,5); el resto de las secciones sin evaluaciones, incluida MAT102 de la misma docente.
- Calcular, por **asignatura + docente**, el promedio de la valoración docente y de la dificultad, redondeado a un decimal.
- Mostrar en cada sección del planificador (listado de la oferta y secciones incluidas) la valoración del docente con estrellas y número, y la dificultad con número.
- Mostrar «Sin evaluaciones» y ningún valor cuando la sección no tiene evaluaciones.
- No registrar evaluaciones, no mostrar comentarios y no moderar contenido en esta historia.

## Capabilities

### New Capabilities

- `referencias-comunitarias`: consulta de la valoración docente y de la dificultad de una asignatura a partir de evaluaciones anónimas, desplegada dentro del planificador.

### Modified Capabilities

Ninguna. La especificación `simulacion-horario` no cambia: HU-03 solo agrega información de consulta a las secciones que ya muestra el planificador.

## Impact

- Base de datos: nueva migración `src/db/migrations/002_evaluaciones.sql` y datos de ejemplo en `src/db/seed.ts`.
- Dominio: tipo `Evaluacion` y métricas de sección en `src/dominio/tipos.ts`; consulta de promedios en `src/dominio/repositorios.ts`.
- Pantalla: `GET /planificador` y las tablas de secciones en `src/vistas/parciales/secciones.ejs` (o un parcial de métricas reutilizable).
- Pruebas: nueva `tests/hu-03.test.ts` con una prueba por escenario Gherkin; las pruebas de HU-02 deben seguir pasando.
- Documentación: `README.md` con el recorrido de los dos escenarios.

## Fuera de alcance

- Registrar evaluaciones o comentarios y moderarlos (RP-12).
- Carga y traducción de Excel (HU-01), simulación y validaciones (HU-02), malla y tiempo restante (HU-04/HU-05).
- Requisitos no funcionales RP-09…RP-12; de RP-11 solo se cumple la restricción de no guardar ni mostrar identidad.

## Trazabilidad

- Historia: **HU-03 — Consulta de Referencias Comunitaria y Dificultad Docente** (`04-historias-usuario.md`; Gherkin en `07-criterios-aceptacion.md`).
- Actividad del TO-BE: **«Simular horario y revisar métricas de dificultad»**.
- Casos de uso: **CU-11 — Consultar valoración comunitaria del docente** y **CU-12 — Consultar nivel de dificultad de la asignatura**.
- Requisito funcional: **RP-06**. Contexto: RP-11 (anonimato).
