# Tasks

## 1. Datos de malla, prerrequisitos y avance

- [x] 1.1 Crear `src/db/migrations/003_malla.sql` con las tablas `carrera_asignatura`, `asignatura_prerrequisito` (con `CHECK` de no auto-prerrequisito) y `asignatura_cursada` (resultado con `CHECK` y `UNIQUE (estudiante_id, asignatura_id)`); verificar que `npm test` aplica la migración sin errores en una base en memoria.
- [x] 1.2 Agregar ECU301 «Ecuaciones Diferenciales» (6 créditos, semestre 3, sin sección) en `src/db/seed.ts`; verificar que el seed dos veces deja una sola fila.
- [x] 1.3 Sembrar la malla de la carrera con las 8 asignaturas actuales más ECU301; verificar que no se duplican filas al sembrar dos veces.
- [x] 1.4 Sembrar los prerrequisitos MAT101 → MAT102, MAT102 → ECU301 y PROG101 → BD101; verificar con una consulta que existen exactamente esos pares.
- [x] 1.5 Sembrar el avance del estudiante demo: MAT101, FIS101 y PROG101 aprobadas, ING101 en curso, el resto sin registro; verificar que el seed es idempotente.

## 2. Lógica de estado y cadena

- [x] 2.1 Definir `EstadoAsignatura`, `AsignaturaEnMalla` y `CadenaAsignatura` en `src/dominio/tipos.ts`; verificar que compila con `npx tsc --noEmit`.
- [x] 2.2 Implementar `calcularEstado` en `src/dominio/malla.ts` (aprobada / disponible / bloqueada, etiqueta «en curso», solo aprobada satisface prerrequisitos); verificar con pruebas unitarias que una reprobada con prerrequisitos aprobados queda disponible y que «en curso» no satisface un prerrequisito.
- [x] 2.3 Implementar `calcularCadena` en `src/dominio/malla.ts` (red transitiva de prerrequisitos y dependientes con conjunto de visitados); verificar con una prueba unitaria la cadena MAT101 ← MAT102 ← ECU301.
- [x] 2.4 Implementar `listarMalla(db, carreraId)`, `listarPrerrequisitos(db)` y `listarAvance(db, estudianteId)` en `src/dominio/repositorios.ts`; verificar con pruebas que devuelven las 9 asignaturas de la malla y el avance esperado.

## 3. Pantalla de la malla

- [x] 3.1 Crear `src/rutas/malla.ts` con `GET /malla` y el parámetro opcional `asignatura`; registrar el router en `src/app.ts` y verificar que responde 200 con el estudiante demo.
- [x] 3.2 Crear `src/vistas/malla.ejs` con las asignaturas agrupadas por semestre sugerido, cada una como enlace, con los tres colores de estado, la etiqueta del resultado no aprobado y los avisos «Sin prerrequisitos» / «Sin asignaturas dependientes»; verificar el renderizado con los datos sembrados.
- [x] 3.3 Aplicar los estilos de seleccionada / relacionada / atenuada en `src/vistas/malla.ejs` manteniendo visible el color de estado; verificar visualmente y en el HTML generado.
- [x] 3.4 Agregar el enlace «Malla» en `src/vistas/parciales/cabecera.ejs`; verificar que navega a `/malla` desde el planificador.

## 4. Pruebas y documentación

- [x] 4.1 Escribir en `tests/hu-04.test.ts` la prueba del escenario «Una asignatura con prerrequisitos y dependientes muestra su cadena y su estado» (MAT101 aprobada, MAT102 disponible, ECU301 bloqueada; prerrequisito y dependiente señalados); verificar que pasa con `npm test`.
- [x] 4.2 Escribir en `tests/hu-04.test.ts` la prueba del escenario «Una asignatura sin prerrequisitos muestra solo las asignaturas que dependen de ella» («Sin prerrequisitos» y dependientes MAT102 y ECU301); verificar que pasa con `npm test`.
- [x] 4.3 Ejecutar `npm test` completo y `npx tsc --noEmit`, y comprobar que las pruebas de HU-02 y HU-03 siguen pasando.
- [x] 4.4 Ejecutar `npm run db:seed` y abrir `http://localhost:3000/malla` para recorrer los dos escenarios; verificar el resultado visible.
- [x] 4.5 Actualizar `README.md` con cómo abrir la malla y recorrer los dos escenarios; verificar que los comandos documentados funcionan tal como están escritos.

## Workflow follow-up

- Validar el sistema con el estudiante usando `cin324-validar-sistema` antes de archivar.
- Archivar el cambio con `openspec-archive-change` y actualizar `.cin324/proyecto.md`.
- Sugerir el commit de HU-04 cuando el estudiante lo autorice.
