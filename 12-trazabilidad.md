# Trazabilidad

## Matriz de trazabilidad

Las rutas de las columnas **Código** y **Prueba** son relativas a la raíz del repositorio.

| Requisito (Entrega 1) | Historia | Caso de uso | Secuencia | Estado | Clases del dominio | Código | Prueba |
|-----------------------|----------|-------------|-----------|--------|---------------------|--------|--------|
| RP-01 | HU-01 | CU-01 | DSS-01 | EST-01 | Oferta Académica, Sección, Asignatura | `src/rutas/carga.ts`, `src/servicios/leerPlanilla.ts`, `src/servicios/parsearOferta.ts`, `src/servicios/publicarOferta.ts`, `src/dominio/estadoOferta.ts` | `tests/hu-01.test.ts`, `tests/integracion-hu-01.test.ts` |
| RP-02 | HU-01 | CU-02, CU-03, CU-04 | DSS-01 | EST-01 | Oferta Académica, Sección, Asignatura | `src/rutas/carga.ts`, `src/servicios/leerPlanilla.ts`, `src/servicios/parsearOferta.ts`, `src/servicios/publicarOferta.ts`, `src/dominio/estadoOferta.ts` | `tests/hu-01.test.ts`, `tests/integracion-hu-01.test.ts` |
| RP-03 | HU-04 | CU-13, CU-14 | — | — | Asignatura, Asignatura Cursada, Carrera | `src/rutas/malla.ts`, `src/dominio/malla.ts` | `tests/hu-04.test.ts` |
| RP-04 | HU-05 | CU-15, CU-16 | — | — | Estudiante, Asignatura, Asignatura Cursada, Carrera | `src/rutas/tiempo-restante.ts`, `src/dominio/tiempo-restante.ts` | `tests/hu-05.test.ts` |
| RP-05 | HU-02 | CU-05 | DSS-02 | — | Simulación de Horario, Sección, Asignatura | `src/rutas/planificador.ts`, `src/servicios/simulacion.ts`, `src/dominio/horario.ts` | `tests/hu-02.test.ts`, `tests/app.test.ts` |
| RP-06 | HU-03 | CU-11, CU-12 | — | — | Evaluación, Asignatura, Sección | `src/dominio/metricas.ts`, `src/dominio/repositorios.ts`, `src/vistas/parciales/metricas.ejs` | `tests/hu-03.test.ts` |
| RP-07 | HU-02 | CU-05 | DSS-02 | — | Simulación de Horario, Sección, Carrera | `src/rutas/planificador.ts`, `src/servicios/simulacion.ts`, `src/dominio/horario.ts` | `tests/hu-02.test.ts`, `tests/app.test.ts` |
| RP-08 | — | — | — | — | Simulación de Horario | — | — |
| RP-09 | HU-01 | CU-01, CU-02 | DSS-01 | EST-01 | Oferta Académica, Sección | `src/rutas/carga.ts`, `src/servicios/leerPlanilla.ts`, `src/servicios/parsearOferta.ts`, `src/servicios/publicarOferta.ts`, `src/dominio/estadoOferta.ts` | `tests/hu-01.test.ts`, `tests/integracion-hu-01.test.ts` |
| RP-10 | HU-02 | CU-05 | DSS-02 | — | Simulación de Horario, Sección | `src/rutas/planificador.ts`, `src/servicios/simulacion.ts`, `src/dominio/horario.ts` | `tests/hu-02.test.ts`, `tests/app.test.ts` |
| RP-11 | HU-03 | CU-11, CU-12 | — | — | Evaluación, Asignatura | `src/dominio/metricas.ts`, `src/dominio/repositorios.ts`, `src/vistas/parciales/metricas.ejs` | `tests/hu-03.test.ts` |
| RP-12 | — | — | — | — | Evaluación | — | — |

## Observaciones

- RP-08 (guardar o exportar la simulación) y RP-12 (moderación de comentarios) no tienen historia de usuario en la Entrega 1, por lo que no se asocian a casos de uso ni a diagramas. RP-08 corresponde a la actividad "Confirmar e inscribir horario simulado" del TO-BE.
- HU-03 tiene los casos de uso CU-11 y CU-12; HU-04 y HU-05 tienen CU-13/CU-14 y CU-15/CU-16, respectivamente. Ninguna de estas historias tiene diagrama de secuencia ni de estado: el modelado de esta entrega se concentró en HU-01 y HU-02, las historias con mayor lógica de interacción. Sus criterios de aceptación están en `07-criterios-aceptacion.md` y sus conceptos en el modelo de dominio (`08-modelo-dominio.md`).
- HU-02 no tiene diagrama de estado: la clase Simulación de Horario solo pasa por dos estados (en armado y confirmada), por lo que no se justificó un diagrama adicional.
- HU-01 publica la oferta activa que consume HU-02 y conserva la identidad de **Asignatura** (código único) para que las evaluaciones de HU-03 y la malla/avance de HU-04/HU-05 sigan asociados. HU-01 no modifica `carrera_asignatura`, `asignatura_prerrequisito` ni `asignatura_cursada`.
- Solo la clase Oferta Académica tiene diagrama de estado (EST-01), por ser la de ciclo de vida más relevante.
- RP-09 a RP-12 son requisitos no funcionales (tiempos de respuesta, anonimato y moderación). Se asocian a la historia donde aplican, pero no tienen diagrama propio, porque son restricciones de calidad y no flujos de interacción.
