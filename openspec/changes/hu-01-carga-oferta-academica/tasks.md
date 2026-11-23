# Tasks — HU-01 Carga y Traducción de Oferta Académica en Excel

## 1. Dependencias, migración y datos de ejemplo

- [ ] 1.1 Instalar `multer`, `exceljs` y `csv-parse` con `npm install` y verificar que quedan en `package.json`/`package-lock.json` y que `npm test` sigue ejecutándose sin error.
- [ ] 1.2 Crear `src/db/migrations/004_estado_oferta.sql` que agregue a `oferta_academica` la columna `estado TEXT NOT NULL DEFAULT 'Publicada'` con `CHECK` sobre los siete estados de EST-01 y la columna `borrador TEXT` nullable; verificar que se aplica dos veces sin error, queda registrada en `schema_migrations` y las filas sembradas quedan como `Publicada`.
- [ ] 1.3 Crear `datos/ejemplo-oferta-2026-3.csv` con las columnas `periodo,codigo,nombre,numero,docente,bloques,creditos,cupos,semestreSugerido`, al menos dos secciones válidas y una fila inválida; verificar que el archivo se lee con `csv-parse` y produce tres filas.
- [ ] 1.4 Actualizar `tests/db.test.ts` para esperar **4** migraciones y verificar que la base vacía conserva todas las tablas y que `npm test` sigue en verde.

## 2. Dominio: ciclo de EST-01 y traducción de la planilla

- [ ] 2.1 Crear `src/dominio/estadoOferta.ts` con una única función `aplicarTransicion(estado, evento, guarda)` que cubra todas las transiciones de la ficha (incluidas `Rechazada`, `Con inconsistencias → corregirMapeo` y `Estructurada → Publicada`) y rechace las inválidas con mensaje claro; verificar con `tests/estado-oferta.test.ts` un caso por transición válida y al menos dos inválidas.
- [ ] 2.2 Crear el adaptador `leerPlanilla(archivo)` en `src/servicios/leerPlanilla.ts`: `exceljs` para `.xlsx` (primera hoja) y `csv-parse` para `.csv` (delimitador `,` o `;`), devolviendo filas de texto; verificar con `tests/leer-planilla.test.ts` que lee el ejemplo CSV y un `.xlsx` generado en la prueba.
- [ ] 2.3 Crear `src/servicios/parsearOferta.ts` para aplicar el mapeo de columnas, dividir los bloques horarios (`dia HH:MM-HH:MM` separados por `;`) y validar créditos `> 0`, cupos `>= 0`, semestre entero `>= 1`, días y horas; recortar y colapsar espacios en `docente` sin cambiar el nombre. Verificar con `tests/parsear-oferta.test.ts` los cuatro motivos (sin código, sin bloques, sección duplicada, crédito/cupo/semestre inválido), el número de fila, el descarte de la segunda fila duplicada y la normalización del docente.

## 3. Persistencia, publicación e integración

- [ ] 3.1 Agregar `ofertaPublicadaActiva(db)` en `src/dominio/repositorios.ts` (última oferta `Publicada` por `fecha_publicacion` e `id`) y filtrar por ese `oferta_id` `listarSeccionesDisponibles`, `listarSeccionesDeSimulacion` y `calcularCreditos`; verificar con `tests/oferta-activa.test.ts` que con el `seed` la activa es 2026-2 y que al publicar 2026-3 pasa a ser la activa.
- [ ] 3.2 Crear `src/servicios/publicarOferta.ts` que reutilice/actualice `asignatura` por `codigo` conservando su `id`, inserte `seccion` y `bloque_horario`, fije `fecha_publicacion`, rechace un período ya publicado y exija al menos una sección válida; dentro de la misma transacción, retirar de `simulacion_seccion` las secciones de ofertas anteriores. Verificar con `tests/publicar-oferta.test.ts` los datos persistidos, la conservación del `id`, los dos rechazos y la limpieza de la simulación.
- [ ] 3.3 Crear `tests/integracion-hu-01.test.ts` para verificar que la oferta publicada activa el simulador de HU-02, que HU-03 conserva las métricas de MAT101/Prof. Ana Pérez y muestra «Sin evaluaciones» para un docente nuevo, y que HU-04/HU-05 mantienen la malla de 13 asignaturas, 7 prerrequisitos, el avance y el mínimo de 4 semestres. Incluir el caso de una asignatura nueva que aparece en el simulador pero no en la malla.

## 4. Rutas e interfaz derivadas de DSS-01

- [ ] 4.1 Registrar el router `src/rutas/carga.ts` en `src/app.ts` e implementar `GET /carga` con el selector de rol de demostración (Estudiante / Administrador comunitario) y el enlace a la planilla de ejemplo; agregar el enlace «Carga de oferta» en `src/vistas/parciales/cabecera.ejs` y aceptar `administrador` en `POST /rol`. Verificar con supertest que `/carga` responde 200, que la cabecera muestra el rol correcto y que el enlace aparece en `/planificador`.
- [ ] 4.2 Implementar `POST /carga/archivo` con `multer` (`memoryStorage`, límite 5 MB), validación estricta de `.xlsx`/`.csv`, registro de la oferta en `Archivo recibido → Mapeo en revisión` y vista previa con mapeo; verificar con supertest el `attach` del ejemplo y el mensaje «Formato no admitido: use .xlsx o .csv» para una extensión inválida.
- [ ] 4.3 Implementar `POST /carga/:id/mapeo` (corrección de columnas con reproceso en `loop`) y `POST /carga/:id/excluir` (confirmar la exclusión como `corregirMapeo`); verificar con supertest que una fila antes inválida pasa a la vista previa al corregir su columna y que el estado vuelve a `Mapeo en revisión`.
- [ ] 4.4 Implementar `POST /carga/:id/confirmar` y `POST /carga/:id/cancelar`; verificar con supertest que confirmar guarda la oferta `Publicada` con sus secciones y notifica «Oferta publicada y disponible en el simulador», y que cancelar elimina el borrador sin publicar.
- [ ] 4.5 Crear `src/vistas/carga.ejs` y sus parciales: formulario con selección y arrastrar de archivo, tabla de mapeo editable, tabla de secciones interpretadas y lista de errores con fila y motivo; verificar que todas las rutas renderizan sin error y muestran los mensajes en español.

## 5. Verificación de integración y documentación

- [ ] 5.1 Crear `tests/hu-01.test.ts` con un escenario por cada uno de los seis del Gherkin y las dos variantes confirmadas (período ya publicado y sin secciones válidas), comprobando el estado persistido y las filas de `oferta_academica`, `asignatura`, `seccion` y `bloque_horario`; verificar que `npm test` termina en verde con todas las pruebas. Los dos escenarios de integración se cubren en `tests/integracion-hu-01.test.ts` (tarea 3.3).
- [ ] 5.2 Verificar que las pruebas existentes de HU-02, HU-03, HU-04 y HU-05 siguen pasando sin cambios y que `npx tsc --noEmit` no reporta errores.
- [ ] 5.3 Actualizar `README.md` con instalación, preparación de la base, ejecución, URL, el recorrido por los escenarios, la oferta activa, el enlace de carga y el papel del archivo de ejemplo como Universidad simulada; verificar que cada comando documentado se ejecuta tal como aparece.

## Guardrails

- No modificar `src/db/migrations/003_malla.sql`, `src/dominio/malla.ts`, `src/dominio/tiempo-restante.ts`, `src/rutas/malla.ts` ni el seed de malla/avance de HU-04/HU-05.
- No insertar ni eliminar filas de `carrera_asignatura` ni de `asignatura_prerrequisito`; no modificar `asignatura_cursada`.
- No crear, modificar ni moderar evaluaciones; HU-03 solo se beneficia de la identidad de `Asignatura` y del texto de `docente`.
- Mantener el `seed` 2026-2 como dato de ejemplo y usar 2026-3 en los ejemplos y pruebas de HU-01.

## Workflow follow-up

- Archivar el cambio `hu-01-carga-oferta-academica` cuando el estudiante apruebe la implementación.
- Verificar el resultado archivado y actualizar `.cin324/proyecto.md` con el estado final de HU-01.
