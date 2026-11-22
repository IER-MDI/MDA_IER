# Tasks

## 1. Datos y cálculo de métricas

- [x] 1.1 Crear `src/db/migrations/002_evaluaciones.sql` con la tabla `evaluacion` (sin referencia al estudiante), sus `CHECK` de 1 a 5 y el índice `(asignatura_id, docente)`; verificar que `npm test` aplica la migración sin errores en una base en memoria.
- [x] 1.2 Agregar las tres evaluaciones de ejemplo de MAT101 / Prof. Ana Pérez en `src/db/seed.ts`, insertándolas solo si la tabla está vacía; verificar con una prueba que, tras sembrar dos veces, `evaluacion` tiene exactamente 3 filas.
- [x] 1.3 Definir `Evaluacion` y `MetricasSeccion` en `src/dominio/tipos.ts` e implementar `obtenerMetricasSeccion(db, asignaturaId, docente)` en `src/dominio/repositorios.ts`; verificar con una prueba que MAT101 / Prof. Ana Pérez devuelve 3 evaluaciones, 4,0 y 4,3, y que MAT102 / Prof. Ana Pérez devuelve 0 y `null`.
- [x] 1.4 Agregar helpers de presentación para redondear a un decimal, formatear con coma y dibujar 5 estrellas; verificar con una prueba unitaria que 4,333… se formatea como «4,3» y que 4,0 produce 4 estrellas llenas.

## 2. Pantalla del planificador

- [x] 2.1 Crear `src/vistas/parciales/metricas.ejs` con las dos ramas (con evaluaciones: valoración con estrellas y número, dificultad con número; sin evaluaciones: una celda `colspan="2"` con «Sin evaluaciones») e incluirlo en ambas tablas de `src/vistas/parciales/secciones.ejs`; verificar que la página renderiza ambas ramas con los datos sembrados.
- [x] 2.2 Enriquecer las secciones con `metricas` en `GET /planificador` (`src/rutas/planificador.ts`) sin agregar endpoints; verificar que la página muestra «4,0», «4,3» y «Sin evaluaciones» según la sección.
- [x] 2.3 Escribir en `tests/hu-03.test.ts` la prueba del escenario «Una sección con evaluaciones muestra la valoración del docente y la dificultad de la asignatura», incluyendo que el esquema de `evaluacion` no tiene columnas de identidad del estudiante; verificar que la prueba pasa con `npm test`.
- [x] 2.4 Escribir en `tests/hu-03.test.ts` la prueba del escenario «Una sección sin evaluaciones no muestra valores inventados», verificando «Sin evaluaciones» y la ausencia de «0,0» para esa sección; verificar que la prueba pasa con `npm test`.

## 3. Integración y documentación

- [x] 3.1 Ejecutar `npm test` completo y `npx tsc --noEmit`, y comprobar que las pruebas de HU-02 siguen pasando; verificar que no hay errores de tipos ni de migración.
- [x] 3.2 Ejecutar `npm run db:seed` sobre la base de desarrollo y abrir `http://localhost:3000/planificador` para comprobar una sección con métricas y otra con «Sin evaluaciones»; verificar el resultado visible.
- [x] 3.3 Actualizar `README.md` con los comandos de instalación, ejecución y prueba, y con el recorrido de los dos escenarios de HU-03; verificar que los comandos documentados funcionan tal como están escritos.

## Workflow follow-up

- Validar el sistema con el estudiante usando `cin324-validar-sistema` antes de archivar.
- Archivar el cambio con `openspec-archive-change` y actualizar `.cin324/proyecto.md`.
- Sugerir el commit de HU-03 cuando el estudiante lo autorice.
