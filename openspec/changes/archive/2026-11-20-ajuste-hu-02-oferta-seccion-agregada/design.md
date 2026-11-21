# Design — Ajuste HU-02: la sección agregada sale de la oferta

## Context

Ver `proposal.md` — Why. El cambio base `hu-02-planificador-grilla` ya está implementado y el sistema fue validado; este ajuste incorpora el cuarto escenario confirmado en `.cin324/historias/HU-02.md`. No hay `EST-xx` para Simulación de Horario, así que no cambian estados. El DSS-02 sigue siendo una reconstrucción no verificable; la disponibilidad es una actualización de la vista, no un mensaje nuevo del flujo.

## Goals / Non-Goals

**Goals:**
- Excluir del listado de la oferta las secciones que ya están en la simulación activa.
- Volver a ofrecerlas al removerlas, sin rutas ni estados nuevos.
- Cubrir el escenario nuevo con una prueba automática.

**Non-Goals:**
- Cambiar el esquema, las migraciones o los datos de ejemplo.
- Filtrar por cupos, choques u otros criterios.
- Ocultar secciones de la grilla o cambiar el flujo de alta/baja.

## Decisions

### Filtrado en la consulta de repositorio

Se agrega `listarSeccionesDisponibles(db, simulacionId)` en `src/dominio/repositorios.ts`, con la misma proyección de `listarSecciones` más la condición:

```sql
WHERE s.id NOT IN (
  SELECT seccion_id FROM simulacion_seccion WHERE simulacion_id = ?
)
```

- Se mantiene `listarSecciones` porque las pruebas de dominio la usan para verificar la oferta completa.
- Alternativa descartada: filtrar en la ruta con un `Set` de ids incluidos. Se descarta para dejar la regla en la capa de datos y poder probarla contra SQLite.

### Ruta del planificador

`GET /planificador` reemplaza `listarSecciones(db)` por `listarSeccionesDisponibles(db, simulacion.id)` y sigue pasando `secciones` a la vista. Las rutas de alta y baja no cambian: al redirigir a `GET`, el listado se recalcula solo.

### Vista

`src/vistas/parciales/secciones.ejs` no cambia: recibe menos filas. Si todas las secciones están en la simulación, la tabla queda vacía; no se agrega un mensaje nuevo porque el Gherkin no lo pide.

### Pruebas

- `tests/hu-02.test.ts`: escenario «Una sección de la simulación deja de ofrecerse y vuelve al removerla» a nivel de repositorio: tras agregar MAT101, `listarSeccionesDisponibles` no la incluye; tras removerla, sí.
- `tests/app.test.ts`: la misma secuencia por HTTP, contando los botones «Agregar» del listado (8 antes del alta, 7 después, 8 tras la baja) y comprobando que MAT101 sigue en «Secciones en tu horario».

## Risks / Trade-offs

- **Secciones incluidas que ya no están en la oferta** → no se ofrecen igual; no aplica con los datos actuales.
- **Una sola simulación activa por estudiante** → el filtro usa esa simulación; las demás quedan fuera de alcance.
- **Listado vacío sin mensaje** → aceptable para el alcance del escenario; se puede mejorar en otra historia.
