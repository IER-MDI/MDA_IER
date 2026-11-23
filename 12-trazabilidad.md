# Trazabilidad

## Matriz de trazabilidad

| Requisito (Entrega 1) | Historia | Caso de uso | Secuencia | Estado | Clases del dominio |
|-----------------------|----------|-------------|-----------|--------|---------------------|
| RP-01 | HU-01 | CU-01 | DSS-01 | EST-01 | Oferta Académica, Sección, Asignatura |
| RP-02 | HU-01 | CU-02, CU-03, CU-04 | DSS-01 | EST-01 | Oferta Académica, Sección, Asignatura |
| RP-03 | HU-04 | CU-13, CU-14 | — | — | Asignatura, Asignatura Cursada, Carrera |
| RP-04 | HU-05 | CU-15, CU-16 | — | — | Estudiante, Asignatura, Asignatura Cursada, Carrera |
| RP-05 | HU-02 | CU-05 | DSS-02 | — | Simulación de Horario, Sección, Asignatura |
| RP-06 | HU-03 | CU-11, CU-12 | — | — | Evaluación, Asignatura, Sección |
| RP-07 | HU-02 | CU-05 | DSS-02 | — | Simulación de Horario, Sección, Carrera |
| RP-08 | — | — | — | — | Simulación de Horario |
| RP-09 | HU-01 | CU-01, CU-02 | DSS-01 | EST-01 | Oferta Académica, Sección |
| RP-10 | HU-02 | CU-05 | DSS-02 | — | Simulación de Horario, Sección |
| RP-11 | HU-03 | — | — | — | Evaluación, Asignatura |
| RP-12 | — | — | — | — | Evaluación |

## Observaciones

- RP-08 (guardar o exportar la simulación) y RP-12 (moderación de comentarios) no tienen historia de usuario en la Entrega 1, por lo que no se asocian a casos de uso ni a diagramas. RP-08 corresponde a la actividad "Confirmar e inscribir horario simulado" del TO-BE.
- HU-03 tiene los casos de uso CU-11 y CU-12; HU-04 y HU-05 tienen CU-13/CU-14 y CU-15/CU-16, respectivamente. Ninguna de estas historias tiene diagrama de secuencia ni de estado: el modelado de esta entrega se concentró en HU-01 y HU-02, las historias con mayor lógica de interacción. Sus criterios de aceptación están en `07-criterios-aceptacion.md` y sus conceptos en el modelo de dominio (`08-modelo-dominio.md`).
- HU-02 no tiene diagrama de estado: la clase Simulación de Horario solo pasa por dos estados (en armado y confirmada), por lo que no se justificó un diagrama adicional.
## Trazabilidad HU → código → prueba

| Historia | Ruta | Código | Prueba | Cambio OpenSpec archivado |
|---|---|---|---|---|
| HU-01 | /carga | `src/vistas/parciales/cabecera.ejs`, `src/vistas/parciales/mensajes.ejs` *(+ rutas/controladores según repo)* | `tests/hu-01.test.ts`, `tests/integracion-hu-01.test.ts`, `tests/leer-planilla.test.ts`, `tests/parsear-oferta.test.ts`, `tests/publicar-oferta.test.ts` | *(revisar carpeta en archive/)* |
| HU-02 | /planificador | `src/vistas/planificador.ejs`, `src/vistas/parciales/grilla.ejs`, `src/vistas/parciales/secciones.ejs` | `tests/hu-02.test.ts`, `tests/oferta-activa.test.ts`, `tests/estado-oferta.test.ts` | *(revisar carpeta en archive/)* |
| HU-03 | /planificador | `src/vistas/planificador.ejs`, `src/vistas/parciales/grilla.ejs`, `src/vistas/parciales/secciones.ejs`, `src/vistas/parciales/metricas.ejs` | `tests/hu-03.test.ts` | *(revisar carpeta en archive/)* |
| HU-04 | /malla | `src/vistas/parciales/grilla.ejs`, `src/vistas/parciales/metricas.ejs` | `tests/hu-04.test.ts` | *(revisar carpeta en archive/)* |
| HU-05 | /tiempo-restante | `src/vistas/tiempo-restante.ejs`, `src/vistas/parciales/cabecera.ejs`, `src/vistas/parciales/metricas.ejs` | `tests/hu-05.test.ts` | `2026-11-23-hu-05-tiempo-restante` |
- HU-01 publica la oferta activa que consume HU-02 y conserva la identidad de **Asignatura** (código único) para que las evaluaciones de HU-03 y la malla/avance de HU-04/HU-05 sigan asociados. HU-01 no modifica `carrera_asignatura`, `asignatura_prerrequisito` ni `asignatura_cursada`.
- Solo la clase Oferta Académica tiene diagrama de estado (EST-01), por ser la de ciclo de vida más relevante.
- RP-09 a RP-12 son requisitos no funcionales (tiempos de respuesta, anonimato y moderación). Se asocian a la historia donde aplican, pero no tienen diagrama propio, porque son restricciones de calidad y no flujos de interacción.
