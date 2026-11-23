# Design

## Context

Ver `proposal.md` para la motivación. La aplicación ya tiene el planificador (HU-02) con métricas (HU-03), el estudiante demo se obtiene con `obtenerEstudianteDemo(db)` y las migraciones SQL se aplican en orden al abrir la base (`src/db/conexion.ts`, registradas en `schema_migrations`). No existen tablas de malla, prerrequisitos ni avance curricular, y no hay diagrama de secuencia ni de estado para HU-04: el flujo se reconstruye desde el Gherkin y los estados son visuales derivados.

## Goals / Non-Goals

**Goals:**
- Guardar la malla de la carrera, la asociación `es prerrequisito de` y el avance del estudiante, con datos de ejemplo idempotentes.
- Derivar el estado de cada asignatura (aprobada / disponible / bloqueada) y mostrar la red transitiva de prerrequisitos y dependientes de la asignatura seleccionada.
- Reutilizar el estudiante demo y el layout existente; pantalla nueva de solo lectura.

**Non-Goals:**
- Calcular semestres restantes ni simular reprobación/postergación (HU-05).
- Modelar correquisitos (RP-03 los menciona, pero el modelo y el Gherkin solo tienen prerrequisitos).
- Registrar o modificar avance curricular; no hay escritura en esta historia.
- Autenticación real: se usa el único estudiante de ejemplo.

## Decisions

### Tablas

Se derivan de las clases **Carrera**, **Asignatura** y **Asignatura Cursada** y de la asociación `es prerrequisito de` del modelo de dominio.

```sql
CREATE TABLE IF NOT EXISTS carrera_asignatura (
  carrera_id INTEGER NOT NULL REFERENCES carrera(id) ON DELETE CASCADE,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  PRIMARY KEY (carrera_id, asignatura_id)
);

CREATE TABLE IF NOT EXISTS asignatura_prerrequisito (
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  prerrequisito_id INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  PRIMARY KEY (asignatura_id, prerrequisito_id),
  CHECK (asignatura_id <> prerrequisito_id)
);

CREATE TABLE IF NOT EXISTS asignatura_cursada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL REFERENCES estudiante(id) ON DELETE CASCADE,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  resultado TEXT NOT NULL CHECK (resultado IN ('aprobada', 'reprobada', 'en curso')),
  periodo TEXT NOT NULL,
  UNIQUE (estudiante_id, asignatura_id)
);
```

- `carrera_asignatura` materializa `tiene en su malla` (Carrera 1..* – 1..* Asignatura) sin duplicar `semestre_sugerido`, que ya vive en `asignatura`.
- `asignatura_prerrequisito` materializa `es prerrequisito de` como tabla de pares; el `CHECK` impide que una asignatura sea prerrequisito de sí misma. Los ciclos no se validan en la base porque los datos de ejemplo son controlados; el recorrido usa un conjunto de visitados, así que un ciclo no cuelga la consulta.
- `asignatura_cursada` guarda **un registro por estudiante y asignatura** (`UNIQUE`) con el último resultado, simplificación suficiente para el estudiante demo. El modelo permite 0..* registros por estudiante; si en el futuro se guarda el historial completo, se quitará el `UNIQUE` y se elegirá el registro más reciente por `periodo`.
- Alternativa considerada: inferir la malla de todas las asignaturas de la única carrera; se descarta porque el modelo declara la asociación Carrera–Asignatura y una futura carrera adicional rompería la vista.

### Estado derivado de cada asignatura

Función pura en `src/dominio/malla.ts`:

```ts
type EstadoAsignatura = "aprobada" | "disponible" | "bloqueada";

function calcularEstado(
  asignaturaId: number,
  aprobadas: Set<number>,
  prerrequisitos: Map<number, number[]>
): { estado: EstadoAsignatura; enCurso: boolean };
```

- `aprobada`: existe un registro de avance con `resultado = 'aprobada'`.
- `disponible`: no aprobada y **todos** sus prerrequisitos están en `aprobadas` (conjunto vacío de prerrequisitos cuenta como disponible). Una **reprobada** con prerrequisitos aprobados queda disponible.
- `bloqueada`: no aprobada y algún prerrequisito no está aprobado.
- `enCurso`: `true` si el registro de avance tiene `resultado = 'en curso'`; se muestra como **etiqueta** y no cambia el color (el color sale de la regla anterior).
- Solo `aprobada` alimenta el conjunto `aprobadas`; «reprobada» y «en curso» no satisfacen prerrequisitos.

### Cadena transitiva

`calcularCadena(asignaturaId, prerrequisitos)` recorre en anchura:

- **Prerrequisitos** hacia atrás: `prerrequisitos.get(id)` recursivamente.
- **Dependientes** hacia adelante: mapa inverso `dependientes.get(prerrequisitoId)`.

Ambos recorridos usan un `Set` de visitados y no incluyen la asignatura seleccionada. La red resaltada es la unión de ambos conjuntos.

### Pantalla y ruta

- `GET /malla?asignatura=CODIGO` en `src/rutas/malla.ts`; sin `asignatura` solo se muestra la malla completa. Se registra el router en `src/app.ts`.
- Se usa `obtenerEstudianteDemo(db)` (sin login). Si no hay estudiante, se responde 500 con el mismo mensaje que el planificador: «No hay estudiante de ejemplo. Ejecuta npm run db:seed.».
- Nuevas consultas en `src/dominio/repositorios.ts`: `listarMalla(db, carreraId)`, `listarPrerrequisitos(db)`, `listarAvance(db, estudianteId)`.
- Vista `src/vistas/malla.ejs`: asignaturas agrupadas por `semestre_sugerido`; cada asignatura es un enlace `GET /malla?asignatura=<codigo>`.
- Estados visuales con clases CSS: `.estado-aprobada` (verde), `.estado-disponible` (azul), `.estado-bloqueada` (gris). La etiqueta «en curso» (y el resultado no aprobado) se muestra como texto sobre la tarjeta.
- Con selección: la tarjeta seleccionada lleva `.seleccionada`; las de la red, `.relacionada`; las demás, `.atenuada`. Los colores de estado se mantienen en todas. Es renderizado en servidor; no se agrega JavaScript.
- Si la asignatura no tiene prerrequisitos, se muestra «Sin prerrequisitos» y, si tampoco tiene dependientes, «Sin asignaturas dependientes».
- Enlace «Malla» en `src/vistas/parciales/cabecera.ejs`.

### Datos de ejemplo

En `src/db/seed.ts`, de forma idempotente (claves únicas + `ON CONFLICT DO NOTHING` / inserción solo si falta):

| Dato | Valores |
|------|---------|
| Malla | las 8 asignaturas actuales + ECU301 en la carrera «Ingeniería Civil Informática» |
| Asignatura nueva | ECU301 «Ecuaciones Diferenciales», 6 créditos, semestre 3, **sin sección** en la oferta |
| Prerrequisitos | MAT101 → MAT102; MAT102 → ECU301; PROG101 → BD101 |
| Avance | MAT101, FIS101 y PROG101 aprobadas; ING101 en curso; el resto sin registro |

El seed debe poder ejecutarse dos veces sin duplicar filas. No se agrega sección para ECU301: la malla es independiente de la oferta.

### Pruebas

`tests/hu-04.test.ts`, una prueba por escenario Gherkin sobre una base sembrada en memoria:

1. **Escenario con prerrequisitos y dependientes:** al consultar `GET /malla?asignatura=MAT102`, la página marca MAT101 como aprobada, MAT102 como disponible y ECU301 como bloqueada; MAT101 figura como prerrequisito y ECU301 como dependiente; las asignaturas no relacionadas quedan atenuadas y MAT102 seleccionada.
2. **Escenario sin prerrequisitos:** al consultar `GET /malla?asignatura=MAT101`, la página informa «Sin prerrequisitos» y señala MAT102 (y, transitivamente, ECU301) como dependientes.

Se agregan pruebas unitarias de `calcularEstado` (reprobada con prerrequisitos aprobados = disponible; en curso no satisface prerrequisitos) y de `calcularCadena` (red transitiva). Las pruebas de HU-02 y HU-03 deben seguir pasando.

### Integraciones externas

Ninguna. Todos los datos provienen de la base local y del seed.

### Estados

No aplica: no hay `EST-xx` para Asignatura ni Asignatura Cursada. «Aprobada / disponible / bloqueada» son estados visuales derivados de solo lectura.

## Risks / Trade-offs

- **[Un registro de avance por asignatura]** No se conserva el historial de intentos → suficiente para la malla de demostración; se documenta la evolución si se necesita el historial.
- **[Ciclos en prerrequisitos]** La base no los impide → el recorrido con visitados evita bucles; el seed no los introduce.
- **[Colores sin leyenda accesible]** El color por sí solo puede no ser accesible → cada tarjeta muestra también el nombre del estado como texto, no solo el color.
- **[Base existente sin datos nuevos]** La migración se aplica al arrancar, pero la malla y el avance requieren ejecutar el seed → el README y la guía indican `npm run db:seed`.
- **[HU-01 pendiente]** La malla no se carga desde Excel → datos de ejemplo hasta que exista HU-01.

## Migration Plan

1. Agregar `src/db/migrations/003_malla.sql`; `aplicarMigraciones` la ejecuta en orden al abrir la base, también en bases existentes.
2. Ejecutar `npm run db:seed` para cargar ECU301, la malla, los prerrequisitos y el avance (idempotente).
3. Rollback manual en desarrollo: `DROP TABLE asignatura_cursada; DROP TABLE asignatura_prerrequisito; DROP TABLE carrera_asignatura;` y eliminar la versión de `schema_migrations`.

## Open Questions

Ninguna.
