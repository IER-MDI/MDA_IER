# SGAI

## Equipo
- Ignacio Geldes
- Percival Leiva
- Patricio Rivadeneira
- Raúl Arteaga
- Matías Abarca

## Proyecto
**Sistema de Gestión Académica e Inscripción Interactiva (SGAI)**
Plataforma orientada a optimizar el proceso de preinscripción e inscripción de asignaturas universitarias mediante la automatización de la consolidación de oferta académica, visualización de carga de trabajo, simulación interactiva de horarios, proyección completa del avance curricular y centralización de evaluaciones y dificultad percibida por los estudiantes.

## Aplicación web (HU-02 — Planificador en grilla interactiva)

Aplicación TypeScript + Express + EJS con SQLite. Por ahora implementa la simulación de horario de HU-02 con datos de ejemplo de la oferta 2026-2 (la carga de Excel llegará con HU-01).

### Requisitos
- Node.js 20 o superior (probado con Node 26)
- npm

### Instalar, cargar datos y ejecutar
```bash
npm install
npm run db:seed
npm run dev
```

Abre `http://localhost:3000`. La base se crea en `data/app.db` y los datos de ejemplo se pueden recargar con `npm run db:seed` sin duplicar registros.

### Pruebas
```bash
npm test
```

Corre las pruebas de los tres escenarios Gherkin de HU-02, la remoción de secciones, el solapamiento de bloques y las rutas HTTP.

### Datos de ejemplo
Carrera «Ingeniería Civil Informática» con tope de **30 créditos** y un estudiante demo («Mi horario», estado «en armado»).

| Asignatura | Créditos | Bloques |
|------------|----------|---------|
| MAT101 Cálculo I | 5 | lun 08:30–09:50 · mié 08:30–09:50 |
| MAT102 Cálculo II | 6 | mar 10:00–11:20 · jue 10:00–11:20 |
| FIS101 Física I | 6 | lun 09:00–10:20 · mié 09:00–10:20 |
| PROG101 Programación | 6 | mar 08:30–09:50 · jue 08:30–09:50 |
| BD101 Bases de Datos | 6 | mié 10:00–11:20 · vie 10:00–11:20 |
| ING101 Inglés Técnico | 5 | jue 10:00–11:20 · vie 08:30–09:50 |
| ECO101 Economía | 6 | lun 10:00–11:20 · mar 10:00–11:20 |
| HUM101 Ética Profesional | 5 | sáb 10:00–11:20 |

### Recorrido manual de los escenarios
1. **Créditos:** agrega MAT101 (5) y luego MAT102 (6). El total debe mostrar **11 de 30 créditos** y ambas secciones en la grilla.
2. **Choque:** con MAT101 en el horario, intenta agregar FIS101. Debe aparecer «Choque de horario con Cálculo I sección 1» y el total seguir en 11.
3. **Tope:** agrega MAT101, PROG101, BD101, ING101 y ECO101 (28 créditos) e intenta agregar HUM101. Debe aparecer «Se superaría el tope de créditos: 33 de 30» y el total seguir en 28.
4. **Quitar:** usa «Quitar» en cualquier sección incluida; el total se recalcula.

### Estructura
```text
src/app.ts                  # aplicación Express (sin escuchar, para pruebas)
src/server.ts               # arranca el servidor en el puerto 3000
src/db/conexion.ts          # SQLite + migraciones
src/db/migrations/          # migraciones SQL numeradas
src/db/seed.ts              # datos de ejemplo idempotentes
src/dominio/                # tipos, horario y repositorios
src/servicios/simulacion.ts # alta, baja, créditos y validaciones
src/rutas/planificador.ts   # rutas y mensajes
src/vistas/                 # plantillas EJS
tests/                      # pruebas Vitest + supertest
```

### Notas
- No hay autenticación real: la cabecera tiene un selector de rol de demostración.
- Los requisitos no funcionales (RP-09 a RP-12) se leen como contexto y no se implementan.
- Fuera de alcance de esta historia: carga de Excel (HU-01), valoraciones docentes (HU-03), malla y tiempo restante (HU-04, HU-05) y confirmar/exportar la simulación.
