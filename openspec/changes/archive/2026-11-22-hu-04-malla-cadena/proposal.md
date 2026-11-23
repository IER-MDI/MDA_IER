# Proposal

## Why

La HU-04 permite al estudiante explorar la malla de su carrera y desplegar la cadena completa de prerrequisitos y dependientes de una asignatura, para entender el impacto curricular de aprobar o reprobar un curso. Hoy la aplicación solo tiene el planificador de HU-02 con métricas de HU-03; no existe una vista de malla ni datos de prerrequisitos ni de avance curricular.

## What Changes

- Agregar la tabla `carrera_asignatura` para la malla (Carrera 1..* – 1..* Asignatura).
- Agregar la tabla `asignatura_prerrequisito` para la asociación `es prerrequisito de` (Asignatura 0..* – 0..* Asignatura), sin ciclos.
- Agregar la tabla `asignatura_cursada` para el avance del estudiante (`resultado`: aprobada, reprobada, en curso; `periodo`).
- Cargar datos de ejemplo de forma idempotente: ECU301 «Ecuaciones Diferenciales» (semestre 3, 6 créditos, sin sección), prerrequisitos MAT101 → MAT102 → ECU301 y PROG101 → BD101, y avance del estudiante demo (MAT101, FIS101 y PROG101 aprobadas; ING101 en curso; el resto sin registro).
- Calcular el estado visual de cada asignatura: **aprobada**, **disponible** o **bloqueada**; «en curso» es una etiqueta sin cuarto color; una reprobada con prerrequisitos aprobados queda disponible; solo «aprobada» satisface un prerrequisito.
- Agregar la pantalla `GET /malla` que lista la malla por semestre sugerido y, al seleccionar una asignatura, resalta la red transitiva de prerrequisitos y de dependientes, distingue la seleccionada, atenúa las no relacionadas y conserva el color de estado.
- Informar «sin prerrequisitos» cuando la asignatura seleccionada no tiene, mostrando todos sus dependientes; informar cuando no hay dependientes.
- Agregar pruebas automáticas, una por escenario Gherkin.

## Capabilities

### New Capabilities

- `malla-curricular`: consulta de la malla de una carrera con el estado derivado de cada asignatura y la red transitiva de prerrequisitos y dependientes de una asignatura seleccionada.

### Modified Capabilities

Ninguna. La especificación `simulacion-horario` no cambia: HU-04 agrega una pantalla nueva y no modifica el planificador.

## Impact

- Base de datos: nueva migración `src/db/migrations/003_malla.sql` y datos de ejemplo en `src/db/seed.ts`.
- Dominio: tipos `Asignatura`, `AsignaturaCursada`, `EstadoAsignatura`, `CadenaAsignatura` en `src/dominio/tipos.ts`; consultas de malla, cadena y avance en `src/dominio/repositorios.ts`.
- Pantalla: nueva ruta `GET /malla` (`src/rutas/malla.ts`), vista `src/vistas/malla.ejs` y enlace en `src/vistas/parciales/cabecera.ejs`; estilos de los tres colores y del atenuado.
- Pruebas: nueva `tests/hu-04.test.ts` con una prueba por escenario Gherkin; las pruebas de HU-02 y HU-03 deben seguir pasando.
- Documentación: `README.md` con cómo abrir la malla y recorrer los dos escenarios.

## Fuera de alcance

- Cálculo del tiempo restante de titulación y simulación de reprobación/postergación (RP-04, HU-05: CU-15/CU-16).
- Correquisitos (RP-03 los menciona; el modelo de dominio solo tiene `es prerrequisito de`).
- Registrar o modificar el avance curricular; la pantalla es de solo lectura.
- Carga y traducción de Excel (HU-01).
- Requisitos no funcionales RP-09…RP-12.

## Trazabilidad

- Historia: **HU-04 — Malla Interactiva y Cadena Crítica Curricular** (`04-historias-usuario.md`; Gherkin en `07-criterios-aceptacion.md`; ficha en `.cin324/historias/HU-04.md`).
- Actividad del TO-BE: **«Consultar malla interactiva y tiempo restante»** (solo la parte de malla/cadena).
- Casos de uso: **CU-13 — Visualizar malla interactiva con estado de asignaturas** y **CU-14 — Consultar cadena de prerrequisitos de una asignatura**.
- Requisito funcional: **RP-03**.
