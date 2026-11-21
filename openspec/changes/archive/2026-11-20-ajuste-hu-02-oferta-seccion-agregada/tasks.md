# Tasks — Ajuste HU-02: la sección agregada sale de la oferta

## 1. Consulta de disponibilidad

- [x] 1.1 Agregar `listarSeccionesDisponibles(db, simulacionId)` en `src/dominio/repositorios.ts` con la oferta menos las secciones de `simulacion_seccion`; verificar con una prueba de integración contra la base sembrada que devuelve 8 secciones al inicio y 7 después de agregar MAT101.
- [x] 1.2 Agregar la prueba del escenario «Una sección de la simulación deja de ofrecerse y vuelve al removerla» en `tests/hu-02.test.ts`, comprobando que MAT101 desaparece del listado al agregarla y reaparece al removerla.

## 2. Ruta y pantalla

- [x] 2.1 Cambiar `GET /planificador` para usar `listarSeccionesDisponibles` con la simulación activa; verificar con una prueba HTTP que el listado de la oferta pasa de 8 a 7 botones «Agregar» tras el alta y que MAT101 sigue en «Secciones en tu horario».
- [x] 2.2 Verificar por HTTP que, tras remover MAT101, la oferta vuelve a mostrar sus 8 botones «Agregar», MAT101 reaparece en el listado y el total de créditos queda en 0.

## 3. Integración y documentación

- [x] 3.1 Ejecutar `npm test` completo y `npx tsc --noEmit`; verificar que pasan todas las pruebas, incluida la del cuarto escenario, y que no hay errores de tipos.
- [x] 3.2 Actualizar `README.md` con los cuatro escenarios y el recorrido del nuevo (agregar, comprobar que sale de la oferta, quitar y comprobar que vuelve); verificar que los comandos documentados funcionan tal como están escritos.

## Workflow follow-up

- Archivar primero el cambio base `hu-02-planificador-grilla` (ya validado) para que la capability `simulacion-horario` exista en las especificaciones principales.
- Archivar este ajuste después de que el estudiante valide el sistema.
- Actualizar `.cin324/proyecto.md` y el estado de `.cin324/validaciones/VAL-HU-02-1.md` a «verificado en el sistema».
