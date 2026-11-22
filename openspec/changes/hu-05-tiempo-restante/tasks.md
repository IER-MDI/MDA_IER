# Tasks

## 1. Datos de malla y avance

- [x] 1.1 Crear `src/db/migrations/003_malla_avance.sql` con `asignatura_cursada`, `carrera_asignatura` y `prerrequisito` según el modelo de dominio (`08-modelo-dominio.md`) y la decisión de diseño; verificar que `crearBase(":memory:")` aplica la migración y registra una tercera fila en `schema_migrations` sin romper `tests/db.test.ts`.
- [x] 1.2 Ampliar `src/db/seed.ts` con las asignaturas de malla MAT201, MAT202, MAT301 y MAT401 **sin sección**, su vinculación a `carrera_asignatura` y los prerrequisitos MAT101→MAT102→MAT202→MAT301→MAT401 (más MAT201→MAT202), insertándolos solo si no existen; verificar que la cadena pendiente queda de longitud 4.
- [x] 1.3 Agregar en `src/db/seed.ts` el avance de ejemplo: aprobadas MAT101, MAT201, FIS101 y PROG101, y pendientes sin registro MAT102, MAT202, MAT301, MAT401, BD101 y ECO101; verificar que sembrar dos veces no duplica filas en `asignatura_cursada` y que el total de secciones sigue siendo 8.

## 2. Cálculo de la ruta crítica y la simulación

- [x] 2.1 Definir los tipos `AsignaturaPendiente`, `SimulacionTiempo` y `ResultadoTiempoRestante` en `src/dominio/tipos.ts`; verificar que `npx tsc --noEmit` pasa.
- [x] 2.2 Implementar en `src/dominio/repositorios.ts` las consultas `listarAsignaturasDeMalla(db, carreraId)`, `listarCodigosAprobados(db, estudianteId)` y `listarPrerrequisitos(db)`; verificar con una prueba que la malla del estudiante demo tiene 12 asignaturas y que los códigos aprobados son exactamente los cuatro sembrados.
- [x] 2.3 Implementar `calcularTiempoRestante(db, estudianteId, simulacion?)` en `src/dominio/tiempo-restante.ts` con DFS memoizado sobre el grafo de pendientes, marcando los nodos de las rutas más largas como críticos; verificar que sin simulación devuelve `minimoSemestres = 4` y que MAT202 está en `cadenaCritica`.
- [x] 2.4 Implementar la rama de simulación: si la asignatura pertenece a la cadena crítica, mínimo 5 y retraso 1; si no, mínimo 4 y retraso 0; verificar ambos casos con pruebas unitarias y que una asignatura aprobada o ajena a la malla produce un error claro.

## 3. Pantalla y rutas

- [x] 3.1 Crear `src/rutas/tiempo-restante.ts` con `GET /tiempo-restante` y `POST /tiempo-restante/simular`, validando `asignatura_id` y `accion` (`reprobar` o `postergar`) y redirigiendo con parámetros de consulta; verificar que una acción inválida redirige con un mensaje de error.
- [x] 3.2 Montar el router en `src/app.ts` y crear `src/vistas/tiempo-restante.ejs` con el mínimo estimado, la lista de pendientes marcando las críticas, el formulario de simulación y el enlace de vuelta al planificador; verificar que `GET /tiempo-restante` contiene «Mínimo estimado: 4 semestres».
- [x] 3.3 Agregar en `src/vistas/planificador.ejs` un enlace a «Tiempo restante para titularse»; verificar que la página del planificador sigue pasando las pruebas de HU-02 y HU-03.

## 4. Pruebas y documentación

- [x] 4.1 Escribir en `tests/hu-05.test.ts` la prueba del escenario «El sistema estima el mínimo de semestres restantes a partir del avance»; verificar que pasa con `npm test`.
- [x] 4.2 Escribir en `tests/hu-05.test.ts` la prueba del escenario «Simular la reprobación de una asignatura crítica aumenta el tiempo restante» y la variante no crítica; verificar que pasan con `npm test`.
- [x] 4.3 Agregar una prueba HTTP con supertest para `GET /tiempo-restante` y `POST /tiempo-restante/simular`; verificar que el HTML muestra 4 semestres, luego 5 semestres y «Retraso: 1 semestre».
- [x] 4.4 Ejecutar `npm test` completo y `npx tsc --noEmit`; verificar que no hay regresiones en HU-02 ni HU-03.
- [x] 4.5 Actualizar `README.md` con el recorrido manual de los dos escenarios de HU-05 y la nota de que la simulación no se guarda; verificar que los comandos documentados funcionan.

## Workflow follow-up

- Validar el sistema con el estudiante usando `cin324-validar-sistema` antes de archivar.
- Archivar el cambio con `openspec-archive-change` y actualizar `.cin324/proyecto.md`.
- Sugerir el commit de HU-05 cuando el estudiante lo autorice.
