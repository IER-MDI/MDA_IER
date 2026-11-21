# Propuesta — HU-02 Planificador en grilla interactiva

## Why

Hoy el estudiante arma su horario en papel o en una planilla, sumando créditos y buscando choques a mano; eso produce errores de sobrecarga y cruces horarios. HU-02 entrega una grilla interactiva que simula combinaciones sobre la oferta publicada y valida en el momento los choques de horario y el tope de créditos de la carrera.

- Historia: **HU-02 — Planificador en Grilla Interactiva** (`04-historias-usuario.md`).
- Actividades del TO-BE: **«Simular horario y revisar métricas de dificultad»** (parte de simulación) y **«Validar automáticamente topes y créditos en simulador»** (`02-rediseno-to-be.md`). Respecto del AS-IS, reemplaza el cálculo manual de créditos y la detección manual de choques por una validación inmediata del sistema.
- Caso de uso de origen: **CU-05 — Simular horario semestral** (actor: Estudiante), con los casos incluidos CU-06 agregar sección, CU-07 remover sección, CU-08 consultar créditos totales, CU-09 advertir choque de horario y CU-10 advertir exceso de tope.
- Requisitos que cubre: **RP-05** y **RP-07**.

## What Changes

- Nueva página del planificador con una grilla semanal que muestra los bloques de las secciones incluidas en la simulación activa del estudiante.
- Listado de secciones de la oferta académica publicada, con su asignatura, docente, créditos y bloques horarios.
- Agregar una sección a la simulación y removerla, recalculando el total de créditos en cada operación.
- Validación al agregar: si la sección se cruza con un bloque ya incluido, se informa con qué sección choca y no se incorpora; si supera el tope de créditos de la carrera, se informa el exceso y no se incorpora. Si falla ambas, se informa primero el choque.
- Creación automática de una simulación activa vacía («en armado») para el estudiante cuando aún no tiene una.
- Datos de ejemplo de la oferta 2026-2 (asignaturas, secciones y bloques, incluida la pareja en conflicto lunes 08:30–09:50 / 09:00–10:20), una carrera con tope 30 y un estudiante de demostración, porque HU-01 aún no existe.
- Selector de rol de demostración para entrar como el estudiante de ejemplo.

**Fuera de alcance:** carga y traducción de la planilla Excel (HU-01); valoración docente y dificultad de asignaturas (HU-03); malla interactiva y tiempo restante de titulación (HU-04, HU-05); confirmar o exportar la simulación e inscribirla formalmente (RP-08); requisitos no funcionales RP-09…RP-12, que se leen como contexto y no se implementan; autenticación real.

## Capabilities

### New Capabilities
- `simulacion-horario`: simulación del horario semestral de un estudiante sobre la oferta publicada, con grilla semanal, total de créditos y validación de choques de horario y tope crediticio.

### Modified Capabilities
- Ninguna: el proyecto no tiene especificaciones principales todavía.

## Impact

- Código nuevo: estructura del proyecto TypeScript + Express + EJS, migraciones SQL en `src/db/migrations`, datos de ejemplo en `src/db/seed.ts`, lógica de simulación en `src/dominio` y `src/servicios`, rutas en `src/rutas`, vistas en `src/vistas`, pruebas en `tests/`.
- Base de datos SQLite `data/app.db` con tablas derivadas del modelo de dominio: estudiante, carrera, asignatura, sección, bloque horario, simulación y simulación_sección.
- Dependencias nuevas: `express`, `ejs`, `better-sqlite3`, `tsx`, `vitest`, `supertest` y tipos de TypeScript.
- Sin sistemas externos ni integraciones que simular en esta historia.
- Documentación: `README.md` con instalación, datos de ejemplo, ejecución y pruebas.
