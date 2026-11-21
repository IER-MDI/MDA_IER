# Propuesta — Ajuste HU-02: la sección agregada sale de la oferta

## Why

Al validar el sistema, el estudiante observó que una sección agregada a la simulación debería dejar de mostrarse en el listado de la oferta académica y volver al removerla (OBS-1 de `.cin324/validaciones/VAL-HU-02-1.md`). Los artefactos ya se actualizaron (CA1 de `04-historias-usuario.md`, cuarto escenario en `07-criterios-aceptacion.md` y ficha de HU-02), pero el sistema generado sigue ofreciendo todas las secciones aunque ya estén en el horario.

## What Changes

- El listado «Secciones de la oferta académica» excluye las secciones que ya están incluidas en la simulación activa del estudiante.
- Al remover una sección de la simulación, esta vuelve a aparecer en el listado de la oferta.
- Se agrega una prueba automática del nuevo escenario Gherkin y se actualiza el `README.md` (cuatro escenarios).
- Sin cambios de esquema, migraciones ni datos de ejemplo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `simulacion-horario`: se agrega el requisito de disponibilidad de las secciones ya simuladas; una sección incluida no se ofrece en el listado y se vuelve a ofrecer al removerla.

## Impact

- `src/dominio/repositorios.ts`: consulta de secciones de la oferta que excluye las incluidas en una simulación.
- `src/rutas/planificador.ts`: `GET /planificador` usa esa lista para la vista.
- `src/vistas/parciales/secciones.ejs`: recibe la lista ya filtrada; no cambia su estructura.
- `tests/hu-02.test.ts` y `tests/app.test.ts`: prueba del escenario «Una sección de la simulación deja de ofrecerse y vuelve al removerla».
- `README.md`: recorrido con los cuatro escenarios.
- Fuera de alcance: carga de Excel (HU-01), métricas de dificultad (HU-03), malla y tiempo restante (HU-04/HU-05), confirmar o exportar la simulación, y requisitos no funcionales.
