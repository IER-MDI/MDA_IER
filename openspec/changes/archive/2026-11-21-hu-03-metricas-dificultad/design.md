# Design

## Context

Ver `proposal.md` para la motivación. El planificador de HU-02 ya lista las secciones de la oferta y las incluidas, y calcula créditos y grilla en `src/rutas/planificador.ts`. La vista `src/vistas/parciales/secciones.ejs` tiene dos tablas con las mismas columnas. No existe tabla de evaluaciones ni pantalla para registrarlas. No hay diagrama de secuencia ni de estado para HU-03: el flujo se reconstruye desde el Gherkin y no hay transiciones de estado.

## Goals / Non-Goals

**Goals:**
- Guardar evaluaciones anónimas por asignatura y docente, y mostrar sus promedios en ambas tablas del planificador.
- Mantener el anonimato por diseño: la tabla no referencia al estudiante y la vista no muestra identidad.
- Reutilizar la pantalla y la ruta existentes, sin agregar endpoints.

**Non-Goals:**
- Registrar evaluaciones o comentarios, moderarlos o mostrarlos.
- Modelar `Docente` como clase o normalizar nombres.
- Cambiar la especificación `simulacion-horario` o el comportamiento de HU-02.

## Decisions

### Tabla `evaluacion`

Se deriva de la clase **Evaluación** del modelo de dominio (0..* Evaluación – 1 Asignatura):

```sql
CREATE TABLE IF NOT EXISTS evaluacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  docente TEXT NOT NULL,
  calificacion_docente INTEGER NOT NULL CHECK (calificacion_docente BETWEEN 1 AND 5),
  dificultad_percibida INTEGER NOT NULL CHECK (dificultad_percibida BETWEEN 1 AND 5),
  comentario TEXT
);

CREATE INDEX IF NOT EXISTS idx_evaluacion_asignatura_docente
  ON evaluacion (asignatura_id, docente);
```

- `docente` es texto porque el modelo lo define como atributo de Evaluación y no crea una clase Docente.
- `comentario` existe porque el modelo lo declara, pero no se despliega en esta historia.
- **No** hay `estudiante_id` ni otra referencia al estudiante: así se cumple el anonimato desde el esquema (RP-11), sin autenticación.
- Alternativa considerada: tabla `docente` normalizada; se descarta porque contradice el modelo y agrega complejidad que la historia no pide.

### Cálculo de métricas

Nueva función `obtenerMetricasSeccion(db, asignaturaId, docente)` en `src/dominio/repositorios.ts`:

```sql
SELECT COUNT(*) AS total,
       AVG(calificacion_docente) AS valoracion,
       AVG(dificultad_percibida) AS dificultad
FROM evaluacion
WHERE asignatura_id = ? AND docente = ?
```

Devuelve `{ total, valoracionDocente: number | null, dificultad: number | null }`; si `total` es 0, ambos promedios son `null`. El redondeo a un decimal se hace en TypeScript con `Math.round(valor * 10) / 10`, y el formato con coma (`toFixed(1).replace(".", ",")`) en un helper de presentación.

- La clave es **(asignatura, docente)**, no solo docente: MAT102 de la misma docente no hereda las evaluaciones de MAT101.
- Alternativa considerada: una sola consulta agregada para todas las secciones; se descarta por simplicidad: hay pocas secciones y una consulta por sección es clara y fácil de probar.

### Pantalla y ruta

- Se mantiene `GET /planificador`. La ruta enriquece cada sección con `metricas` antes de renderizar; no se agregan endpoints.
- Nuevo parcial `src/vistas/parciales/metricas.ejs`, incluido en las dos tablas de `secciones.ejs`:
  - con evaluaciones: `<td>` de valoración con estrellas y número («4,0 de 5») y `<td>` de dificultad («4,3 de 5»);
  - sin evaluaciones: una sola celda `colspan="2"` con «Sin evaluaciones».
- Las estrellas se calculan con `Math.round(valoracion)` (4,0 → 4 llenas); el número conserva el promedio con un decimal. Alternativa considerada: mostrar solo estrellas; se descarta porque el Gherkin exige los valores 4,0 y 4,3.

### Datos de ejemplo

En `src/db/seed.ts`, insertar las evaluaciones solo si la tabla está vacía:

| Asignatura | Docente | Calificación | Dificultad |
|------------|---------|--------------|------------|
| MAT101 | Prof. Ana Pérez | 5 | 4 |
| MAT101 | Prof. Ana Pérez | 3 | 4 |
| MAT101 | Prof. Ana Pérez | 4 | 5 |

MAT102 (misma docente) y el resto de las secciones quedan sin evaluaciones. Alternativa considerada: `INSERT OR IGNORE` con una restricción única; se descarta porque evaluaciones reales podrían repetir la misma pareja de notas y la restricción sería artificial.

### Pruebas

`tests/hu-03.test.ts`, una prueba por escenario Gherkin sobre `baseSembrada()`:

1. **Escenario con evaluaciones:** las métricas de MAT101 / Prof. Ana Pérez son 4,0 y 4,3 con 3 evaluaciones; `GET /planificador` muestra «4,0», «4,3» y estrellas; el esquema de `evaluacion` no tiene columnas de identidad del estudiante.
2. **Escenario sin evaluaciones:** las métricas de MAT102 / Prof. Ana Pérez son `null` con 0 evaluaciones; la página muestra «Sin evaluaciones» y no muestra «0,0» para esa sección.

Las pruebas de HU-02 deben seguir pasando.

### Integraciones externas

Ninguna. No hay sistema externo en el flujo; las evaluaciones se cargan con datos de ejemplo.

### Estados

No aplica: no hay `EST-xx` para Evaluación, Asignatura ni Sección.

## Risks / Trade-offs

- **[Coincidencia por texto del docente]** Un nombre escrito distinto impide asociar evaluaciones → el seed usa exactamente el mismo texto que `seccion.docente`; se documenta que una futura historia podría normalizar o modelar Docente.
- **[Seed solo si la tabla está vacía]** Si se borran evaluaciones, `npm run db:seed` no las restaura → se documenta el comportamiento y se puede recrear la base en desarrollo.
- **[Base existente sin datos]** La migración se aplica al arrancar, pero las evaluaciones requieren ejecutar el seed → el README y la guía indican `npm run db:seed`.
- **[Estrellas redondeadas]** 4,5 se muestra con 5 estrellas llenas aunque el número sea 4,5 → se acepta como representación visual; el valor numérico es el dato exacto.

## Migration Plan

1. Agregar `src/db/migrations/002_evaluaciones.sql`; `aplicarMigraciones` la ejecuta en orden al abrir la base, también en bases existentes.
2. Ejecutar `npm run db:seed` para cargar las evaluaciones de ejemplo (idempotente).
3. Rollback manual: `DROP TABLE evaluacion;` y eliminar la versión de `schema_migrations` solo en desarrollo.

## Open Questions

Ninguna.
