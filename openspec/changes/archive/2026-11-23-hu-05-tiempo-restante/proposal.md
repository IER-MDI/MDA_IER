# Proposal

## Why

HU-05 pide al estudiante conocer el mínimo estimado de semestres que le faltan para titularse. Hoy la aplicación (HU-02 y HU-03) solo calcula carga horaria, choques y valoraciones; no existe la malla, el avance curricular ni el cálculo de ruta crítica. La actividad del TO-BE «Consultar malla interactiva y tiempo restante» (`02-rediseno-to-be.md`) exige pasar del gráfico estático del AS-IS a un cálculo dinámico de semestres restantes (RP-04). Los casos de uso de origen son CU-15 «Consultar semestres mínimos restantes para titularse» y CU-16 «Simular reprobación o postergación de una asignatura» (`09-casos-uso.md`).

## What Changes

- Agregar la capacidad de consultar el mínimo de semestres restantes a partir del avance del estudiante, la malla de su carrera y la relación «es prerrequisito de» del modelo de dominio.
- Agregar la simulación de reprobar o postergar una asignatura pendiente, mostrando el nuevo mínimo y el retraso en semestres. La simulación se resuelve con parámetros de la petición y **no se persiste**.
- Crear las tablas que faltaban del modelo de dominio (`asignatura_cursada`, `carrera_asignatura`, `prerrequisito`) en una migración nueva y cargar malla y avance de ejemplo en el `seed` idempotente.
- Agregar una pantalla «Tiempo restante» con enlace desde el planificador y una prueba automática por escenario Gherkin.

Fuera del alcance: malla interactiva y resaltado gráfico de cadena (HU-04), carga de Excel (HU-01), simulación de horarios/choques/créditos y valoraciones (HU-02 y HU-03), autenticación real, persistencia de simulaciones y requisitos no funcionales.

## Capabilities

### New Capabilities

- `tiempo-restante`: consulta del mínimo de semestres para titularse según la ruta crítica de asignaturas pendientes y simulación de reprobación o postergación de una asignatura crítica.

### Modified Capabilities

Ninguna.

## Impact

- Código nuevo: `src/dominio/tiempo-restante.ts` (cálculo de ruta crítica y simulación), `src/rutas/tiempo-restante.ts`, `src/vistas/tiempo-restante.ejs`, `src/db/migrations/003_malla_avance.sql`.
- Cambios menores: `src/db/seed.ts` (malla, prerrequisitos y avance de ejemplo), `src/app.ts` (montar el router), `src/vistas/planificador.ejs` (enlace a la nueva pantalla), `README.md` y `openspec/config.yaml` (contexto de malla de ejemplo).
- Base de datos: tres tablas nuevas; no se modifican las migraciones 001 ni 002.
- Integraciones externas: ninguna. No se simulan servicios externos en esta historia.
- Pruebas: `tests/hu-05.test.ts` con un escenario por caso Gherkin más la variante de retraso 0 y la ruta HTTP; se ejecuta con `npm test` junto a las pruebas existentes.
