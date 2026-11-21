# Design — HU-02 Planificador en grilla interactiva

## Context

Ver `proposal.md`. El repositorio solo contiene documentación; no hay código de aplicación. Se crea la estructura inicial del proyecto TypeScript + Express + EJS + SQLite. La ficha confirmada de la historia está en `.cin324/historias/HU-02.md` y los requisitos en `specs/simulacion-horario/spec.md`.

No existe `EST-xx` para Simulación de Horario, así que no hay transiciones que implementar: la simulación se crea y opera en estado «en armado». El flujo de rutas se deriva del DSS-02 reconstruido (no verificable) confirmado en la ficha.

## Goals / Non-Goals

**Goals:**
- Persistir la oferta de ejemplo y el avance de la simulación en SQLite con tablas derivadas del modelo de dominio.
- Servir una página de planificador con grilla semanal, listado de secciones y total de créditos.
- Validar choques de horario y tope de créditos en el servidor, con pruebas automáticas por escenario.
- Dejar la base lista para que HU-01 reemplace los datos de ejemplo por la carga de Excel.

**Non-Goals:**
- Carga de Excel, métricas de dificultad, malla curricular y tiempo restante.
- Confirmar, exportar o inscribir la simulación.
- Autenticación real, control de concurrencia y requisitos no funcionales medibles.

## Decisions

### Tablas derivadas del modelo de dominio
| Clase del modelo | Tabla | Columnas |
|------------------|-------|----------|
| Carrera | `carrera` | `id`, `nombre`, `duracion_semestres`, `tope_creditos_semestre` |
| Estudiante | `estudiante` | `id`, `nombre`, `rut` (único), `carrera_id` |
| Asignatura | `asignatura` | `id`, `codigo` (único), `nombre`, `creditos`, `semestre_sugerido` |
| Oferta Académica | `oferta_academica` | `id`, `periodo`, `fecha_publicacion` |
| Sección | `seccion` | `id`, `oferta_id`, `asignatura_id`, `numero`, `docente`, `cupos`; único (`oferta_id`, `asignatura_id`, `numero`) |
| Sección (`horario`) | `bloque_horario` | `id`, `seccion_id`, `dia`, `hora_inicio`, `hora_fin`; `hora_inicio < hora_fin` |
| Simulación de Horario | `simulacion` | `id`, `estudiante_id`, `nombre`, `estado` («en armado»), `creada_en` |
| Simulación – Sección | `simulacion_seccion` | `simulacion_id`, `seccion_id`; clave primaria compuesta |

- `Simulación.creditosTotales` no se almacena: se calcula sumando `asignatura.creditos` de las secciones incluidas (atributo derivado según el modelo de dominio).
- `Sección.horario` se representa como filas de `bloque_horario` (`dia`, `hora_inicio`, `hora_fin`), no como texto libre, porque la detección de choques necesita comparar intervalos. No se crea una clase nueva: sigue siendo el atributo `horario` de la sección.
- `asignatura_cursada` no se crea todavía: la usan HU-04 y HU-05.
- Alternativa descartada: guardar el horario como JSON en `seccion.horario`. Se descarta porque impide validar solapamientos en SQL y complica los datos de ejemplo.

### Detección de choque y tope
- Dos bloques chocan si tienen el mismo `dia` y `hora_inicio < otraHoraFin` y `otraHoraInicio < hora_fin` (solapamiento de intervalos semiabiertos).
- Al agregar una sección se valida **primero el choque** y luego el tope (confirmado en la ficha). Si falla el choque, se informa la sección con la que choca; si falla el tope, se informa el total que se alcanzaría y el tope.
- La operación se ejecuta en una transacción; si falla una validación no se inserta en `simulacion_seccion`.
- `creditosTotales` se recalcula en cada lectura y tras cada alta o baja.

### Rutas (derivadas del DSS-02 reconstruido)
| Método y ruta | Acción | Respuesta |
|---------------|--------|-----------|
| `GET /` | Redirige al planificador | 302 a `/planificador` |
| `POST /rol` | Selector de rol de demostración (solo «Estudiante»); guarda cookie `rol` | 302 a `/planificador` |
| `GET /planificador` | Muestra grilla, secciones de la oferta, total de créditos y simulación activa | HTML (EJS) |
| `POST /planificador/secciones` | Agrega una sección (`seccion_id`) | 302 con mensaje de éxito, o re-render con el error (choque o tope) |
| `POST /planificador/secciones/:id/eliminar` | Remueve una sección de la simulación activa | 302 con mensaje de éxito |

- Si el estudiante no tiene simulación, `GET /planificador` crea una vacía llamada «Mi horario» en estado «en armado».
- Mensajes en español: «La sección se agregó a tu horario», «Choque de horario con <asignatura> sección <n>», «Se superaría el tope de créditos: <total> de <tope>», «La sección se quitó de tu horario».

### Estructura y módulos
```text
src/app.ts                 # crea Express y monta rutas (sin escuchar)
src/server.ts              # escucha en el puerto 3000
src/db/conexion.ts         # abre SQLite y aplica migraciones
src/db/migrations/001_inicial.sql
src/db/seed.ts             # datos de ejemplo idempotentes
src/dominio/tipos.ts       # tipos del dominio
src/dominio/horario.ts     # solapamiento de bloques
src/dominio/repositorios.ts# consultas SQL de oferta, simulación y secciones
src/servicios/simulacion.ts# agregar, remover, calcular créditos, obtener/crear activa
src/rutas/planificador.ts  # rutas y mensajes
src/vistas/planificador.ejs, src/vistas/parciales/*.ejs
tests/hu-02.test.ts        # una prueba por escenario Gherkin + remoción
```

- Alternativa descartada: React u otro cliente SPA. Se descarta por simplicidad y porque el stack acordado usa plantillas del servidor.

### Datos de ejemplo (idempotentes)
- Carrera «Ingeniería Civil Informática», 10 semestres, tope 30.
- Estudiante demo «Estudiante Demo», rut `11.111.111-1`.
- Oferta 2026-2 y asignaturas/secciones con bloques:
  - MAT101 Cálculo I (5): lun 08:30–09:50, mié 08:30–09:50.
  - MAT102 Cálculo II (6): mar 10:00–11:20, jue 10:00–11:20.
  - FIS101 Física I (6): lun 09:00–10:20, mié 09:00–10:20 (choca con MAT101 el lunes).
  - PROG101 Programación (6): mar 08:30–09:50, jue 08:30–09:50.
  - BD101 Bases de Datos (6): mié 10:00–11:20, vie 10:00–11:20.
  - ING101 Inglés Técnico (5): jue 10:00–11:20, vie 08:30–09:50.
  - ECO101 Economía (6): lun 10:00–11:20, mar 10:00–11:20.
  - HUM101 Ética Profesional (5): sáb 10:00–11:20.
- Con MAT101 + PROG101 + BD101 + ING101 + ECO101 se llega a 28 créditos sin choques; HUM101 (5) los llevaría a 33 y sirve para el escenario de tope. MAT101 + MAT102 suma 11 y no choca.
- El seed no crea simulación: se crea vacía al entrar al planificador.

### Pruebas
- Vitest + supertest contra `app.ts` con una base SQLite temporal por prueba, aplicando migraciones y seed.
- `tests/hu-02.test.ts` con una prueba por escenario Gherkin (tres) y una para remover una sección (CA1 de la historia).
- Cada prueba verifica el estado persistido (secciones incluidas y total de créditos), no solo el HTML.

## Risks / Trade-offs

- **`better-sqlite3` puede no tener binario precompilado para Node 26 en Windows** → si `npm install` falla por compilación nativa, usar el módulo incorporado `node:sqlite` (`DatabaseSync`) con el mismo SQL y ajustar solo `src/db/conexion.ts`.
- **Sin sesiones reales, el selector de rol es una cookie** → aceptable para demostración; no protege rutas ni datos.
- **Un solo estudiante de ejemplo** → los escenarios usan ese estudiante; HU-01/HU-04 añadirán más datos.
- **Comparación de horas como texto `HH:MM`** → funciona si siempre se usa formato de 24 horas con dos dígitos; el seed y los formularios lo respetan.
- **Estados sin diagrama** → si más adelante se confirma la simulación, habrá que añadir `EST-xx` antes de implementar esas transiciones.
