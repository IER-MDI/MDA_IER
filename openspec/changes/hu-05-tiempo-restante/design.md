# Design

## Context

La aplicación ya tiene TypeScript + Express + EJS con SQLite (`better-sqlite3`), migraciones numeradas aplicadas desde `src/db/conexion.ts` y un `seed` idempotente. La migración `001_inicial.sql` ya crea `carrera`, `estudiante` y `asignatura`; la `002_evaluaciones.sql` crea `evaluacion`. El `seed` actual carga 8 asignaturas con sección y horario para HU-02/HU-03, y un único estudiante demo.

No hay DSS ni EST para HU-05, así que el flujo se reconstruyó desde el Gherkin y quedó registrado en `.cin324/historias/HU-05.md`. No hay sistemas externos: malla y avance viven en SQLite.

## Goals / Non-Goals

**Goals:**
- Derivar el mínimo de semestres de las entidades del modelo de dominio: Carrera, Estudiante, Asignatura, Asignatura Cursada y la asociación «es prerrequisito de».
- Mostrar el mínimo y permitir simular reprobar/postergar sin alterar el avance ni crear registros persistentes.
- Cubrir los dos escenarios Gherkin con pruebas automáticas y mantener las pruebas de HU-02 y HU-03 en verde.

**Non-Goals:**
- Malla interactiva, resaltado de cadena y colores de estado (HU-04).
- Carga de Excel (HU-01), simulación de horarios (HU-02) y métricas de dificultad (HU-03).
- Persistir simulaciones, autenticación real y requisitos no funcionales.

## Decisions

1. **Migración `003_malla_avance.sql`** (no reescribir 001 ni 002). Crea solo lo que falta según el modelo de dominio:
   - `asignatura_cursada(id, estudiante_id NOT NULL → estudiante, asignatura_id NOT NULL → asignatura, resultado CHECK ('aprobada','reprobada','en curso'), periodo TEXT NOT NULL)`.
   - `carrera_asignatura(carrera_id NOT NULL → carrera, asignatura_id NOT NULL → asignatura, PRIMARY KEY (carrera_id, asignatura_id))` para la multiplicidad 1..* a 1..* de «tiene en su malla».
   - `prerrequisito(asignatura_id NOT NULL → asignatura, prerrequisito_id NOT NULL → asignatura, PRIMARY KEY (asignatura_id, prerrequisito_id), CHECK (asignatura_id <> prerrequisito_id))` para «es prerrequisito de».
   - Sin `EST-xx` aplicable: no hay columna `estado` nueva con transiciones; `resultado` es el dato del avance y la simulación no lo modifica.
2. **Datos de ejemplo en `src/db/seed.ts`**, insertados de forma idempotente y sin tocar las 8 secciones existentes:
   - Aprobadas: MAT101, MAT201 Álgebra Lineal, FIS101 y PROG101.
   - Cadena pendiente: MAT102 (requiere MAT101) → MAT202 Ecuaciones Diferenciales (requiere MAT102 y MAT201) → MAT301 Análisis Numérico (requiere MAT202) → MAT401 Proyecto de Título (requiere MAT301). Longitud 4 ⇒ mínimo 4 semestres.
   - Pendientes cortos no críticos: BD101 y ECO101 (sin prerrequisitos pendientes), para verificar retraso 0.
   - MAT201, MAT202, MAT301 y MAT401 son asignaturas de malla **sin sección ni bloques**, para no alterar las pruebas que esperan 8 secciones y 15 bloques.
3. **Cálculo en `src/dominio/tiempo-restante.ts`**: `calcularTiempoRestante(db, estudianteId, simulacion?)`. Obtiene las asignaturas de la carrera del estudiante, descarta las aprobadas, construye el grafo de prerrequisitos entre pendientes y calcula por DFS memoizado la ruta más larga (número de nodos). El conjunto de nodos críticos es la unión de las rutas de longitud máxima. Devuelve `{ minimoSemestres, pendientes, cadenaCritica, simulacion }`.
4. **Simulación sin persistencia**: `simulacion` es un parámetro opcional `{ asignaturaId, accion: 'reprobar' | 'postergar' }`. Ambas acciones tienen el mismo efecto: si la asignatura está en `cadenaCritica`, `minimoSemestres + 1` y `retraso = 1`; si no, se mantiene y `retraso = 0`. Se valida que la asignatura sea pendiente; si no, se devuelve un mensaje de error claro.
5. **Rutas y pantalla derivadas del flujo reconstruido**: `GET /tiempo-restante` calcula y renderiza el estado base; `POST /tiempo-restante/simular` recibe `asignatura_id` y `accion` y redirige a `GET /tiempo-restante?asignatura_id=…&accion=…`, que vuelve a calcular con esos parámetros. Así el resultado es visible sin sesión ni escritura en SQLite. Se reutiliza el partial `cabecera.ejs` (selector de rol de demostración) y se agrega un enlace en `planificador.ejs` hacia la nueva pantalla y uno de vuelta.
6. **Pruebas**: `tests/hu-05.test.ts` usa la misma base en memoria de `tests/ayuda.ts`. Una prueba por escenario Gherkin, una para la variante no crítica y una de integración HTTP con supertest.

## Risks / Trade-offs

- La longitud de la ruta crítica se mide en número de asignaturas, no en créditos ni en semestres sugeridos; es la interpretación literal del Gherkin («4 asignaturas sucesivas» → 4 semestres) y quedó confirmada en la ficha.
-«Postergar» se trata igual que «reprobar». Si el curso quiere un modelo distinto, habría que actualizar primero la ficha y los artefactos.
- Un ciclo en los prerrequisitos no está previsto por el dominio; la función lanza un error explícito si aparece, en vez de devolver un número engañoso.
- La simulación viaja en la URL; no es un historial de escenarios ni se comparte entre sesiones, coherente con el alcance acordado.
