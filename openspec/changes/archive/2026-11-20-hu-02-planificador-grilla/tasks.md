# Tasks — HU-02 Planificador en grilla interactiva

## 1. Estructura del proyecto y dependencias

- [x] 1.1 Crear `package.json` con scripts `dev`, `db:seed`, `test` y las dependencias `express`, `ejs`, `better-sqlite3`, `tsx`, `vitest`, `supertest`, `typescript` y sus tipos; verificar que `npm install` termina sin errores.
- [x] 1.2 Crear `tsconfig.json` en modo estricto y la estructura de carpetas `src/db/migrations`, `src/dominio`, `src/servicios`, `src/rutas`, `src/vistas`, `tests`; verificar que `npx tsc --noEmit` no reporta errores.
- [x] 1.3 Crear `src/app.ts` (aplicación Express sin escuchar) y `src/server.ts` (escucha en el puerto 3000); verificar que `npm run dev` responde en `http://localhost:3000` sin fallar.

## 2. Base de datos y datos de ejemplo

- [x] 2.1 Escribir `src/db/migrations/001_inicial.sql` con las tablas `carrera`, `estudiante`, `asignatura`, `oferta_academica`, `seccion`, `bloque_horario`, `simulacion` y `simulacion_seccion`, sus claves y restricciones; verificar que la migración se aplica dos veces sin error y queda registrada en `schema_migrations`.
- [x] 2.2 Implementar `src/db/conexion.ts` para abrir SQLite en `data/app.db` (o en una ruta indicada por variable de entorno para las pruebas) y aplicar las migraciones pendientes; verificar con una prueba que una base vacía queda con todas las tablas.
- [x] 2.3 Implementar `src/db/seed.ts` con la carrera (tope 30), el estudiante demo, la oferta 2026-2 y las asignaturas, secciones y bloques descritos en `design.md`; verificar que `npm run db:seed` ejecutado dos veces no duplica registros y que las secciones suman las combinaciones de 11 y 28 créditos previstas.

## 3. Lógica de dominio

- [x] 3.1 Implementar `src/dominio/horario.ts` con la detección de solapamiento de bloques (mismo día e intervalos que se cruzan); verificar con pruebas unitarias de bloques que se tocan en el límite (09:50/09:50), se solapan (08:30–09:50 con 09:00–10:20) y no se cruzan (08:30–09:50 con 10:00–11:20).
- [x] 3.2 Implementar `src/dominio/tipos.ts` y `src/dominio/repositorios.ts` con las consultas de oferta, secciones con sus bloques, simulación activa del estudiante y secciones incluidas; verificar con una prueba de integración contra la base sembrada que devuelve las 8 secciones y sus bloques.

## 4. Servicio de simulación y pruebas de los escenarios

- [x] 4.1 Implementar `src/servicios/simulacion.ts` con `obtenerSimulacionActiva` (crea «Mi horario» en estado «en armado» si no existe), `calcularCreditos` y `listarSeccionesIncluidas`; verificar que el total de una simulación vacía es 0.
- [x] 4.2 Implementar `agregarSeccion` con la validación en orden choque → tope, dentro de una transacción, devolviendo el resultado tipado (éxito, choque con la sección en conflicto, o tope superado con total y tope); verificar con la prueba del escenario «Agregar una sección a la simulación actualiza la carga de créditos» (5 + 6 = 11).
- [x] 4.3 Verificar con la prueba del escenario «Una sección que choca en horario con la simulación es advertida» (MAT101 lunes 08:30–09:50 y FIS101 lunes 09:00–10:20): informa el choque, no inserta la sección y el total no cambia.
- [x] 4.4 Verificar con la prueba del escenario «Una sección que supera el tope de créditos es advertida» (28 + 5 con tope 30): informa el exceso, no inserta la sección y el total sigue en 28.
- [x] 4.5 Implementar `removerSeccion` y verificar con una prueba que al quitar la sección de 6 créditos de una simulación de 11 el total queda en 5 y la sección desaparece de la grilla.

## 5. Pantallas y rutas

- [x] 5.1 Crear `src/vistas/planificador.ejs` y sus parciales con la grilla semanal (lunes a sábado, franjas de 08:30 a 11:20), el listado de secciones de la oferta con un botón «Agregar», las secciones incluidas con un botón «Quitar», el total de créditos y el tope; verificar con una prueba que `GET /planificador` responde 200 y muestra «Mi horario» y «0 de 30 créditos».
- [x] 5.2 Implementar `src/rutas/planificador.ts` con `GET /planificador`, `POST /planificador/secciones` y `POST /planificador/secciones/:id/eliminar`, mostrando los mensajes de éxito y de error definidos en `design.md`; verificar con pruebas HTTP que un alta válida redirige y aparece en la grilla, y que un choque o un exceso de tope muestran el mensaje correspondiente sin modificar el total.
- [x] 5.3 Implementar el selector de rol de demostración (`GET /`, `POST /rol` con cookie `rol`) con la opción «Estudiante»; verificar que `GET /` redirige a `/planificador` y que la cabecera muestra el rol elegido.

## 6. Integración y documentación

- [x] 6.1 Ejecutar `npm test` completo y verificar que pasan las pruebas de los tres escenarios Gherkin, la de remoción, las unitarias de horario y las HTTP de las pantallas.
- [x] 6.2 Ejecutar `npm run db:seed` y `npm run dev`, y verificar a mano el recorrido: agregar MAT101 y MAT102 (11 créditos), intentar FIS101 (mensaje de choque), quitar MAT102 (5 créditos).
- [x] 6.3 Actualizar `README.md` con requisitos, `npm install`, `npm run db:seed`, `npm run dev` (URL `http://localhost:3000`) y `npm test`; verificar que cada comando documentado funciona tal como está escrito.

## Workflow follow-up

- Revisar las especificaciones con el estudiante antes de implementar (confirmación d del flujo).
- Archivar el cambio después de que el estudiante valide el sistema.
