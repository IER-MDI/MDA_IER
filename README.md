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

## Aplicación web (HU-02 — Planificador · HU-03 — Referencias comunitarias · HU-04 — Malla interactiva)

Aplicación TypeScript + Express + EJS con SQLite. Por ahora implementa la simulación de horario de HU-02, la consulta de valoración docente y dificultad de HU-03 y la malla interactiva con cadena de prerrequisitos de HU-04, con datos de ejemplo de la oferta 2026-2 (la carga de Excel llegará con HU-01).

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

Corre las pruebas de los escenarios Gherkin de HU-02, HU-03 y HU-04, la remoción de secciones, el solapamiento de bloques, los promedios de evaluaciones, el estado y la cadena de la malla, y las rutas HTTP.

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
| ECU301 Ecuaciones Diferenciales | 6 | sin sección (solo malla) |

Evaluaciones de ejemplo, anónimas y sin vínculo con el estudiante:

| Asignatura | Docente | Calificación | Dificultad |
|------------|---------|--------------|------------|
| MAT101 Cálculo I | Prof. Ana Pérez | 5 | 4 |
| MAT101 Cálculo I | Prof. Ana Pérez | 3 | 4 |
| MAT101 Cálculo I | Prof. Ana Pérez | 4 | 5 |

MAT101 queda con **4,0** de valoración docente y **4,3** de dificultad. MAT102, dictada por la misma docente, no tiene evaluaciones y muestra «Sin evaluaciones».

Malla de la carrera (9 asignaturas) y avance del estudiante demo:

| Dato | Valores |
|------|---------|
| Prerrequisitos | MAT101 → MAT102 → ECU301; PROG101 → BD101 |
| Aprobadas | MAT101, FIS101, PROG101 |
| En curso | ING101 |
| Sin registro | MAT102, ECU301, BD101, ECO101, HUM101 |

### Recorrido manual de los escenarios
1. **Créditos:** agrega MAT101 (5) y luego MAT102 (6). El total debe mostrar **11 de 30 créditos** y ambas secciones en la grilla.
2. **Choque:** con MAT101 en el horario, intenta agregar FIS101. Debe aparecer «Choque de horario con Cálculo I sección 1» y el total seguir en 11.
3. **Tope:** agrega MAT101, PROG101, BD101, ING101 y ECO101 (28 créditos) e intenta agregar HUM101. Debe aparecer «Se superaría el tope de créditos: 33 de 30» y el total seguir en 28.
4. **Oferta y quitar:** agrega MAT101 y comprueba que desaparece de «Secciones de la oferta académica» y queda solo en «Secciones en tu horario»; usa «Quitar» y comprueba que vuelve a la oferta y el total queda en **0 de 30 créditos**.

### Recorrido manual de HU-03
5. **Valoración y dificultad:** abre el planificador y busca MAT101 / Prof. Ana Pérez; debe mostrar **★★★★☆ 4,0 de 5** y **4,3 de 5**.
6. **Sin evaluaciones:** busca MAT102 / Prof. Ana Pérez (misma docente, otra asignatura); debe mostrar «Sin evaluaciones» y ningún valor numérico.
7. **Anonimato:** las evaluaciones no muestran ni guardan la identidad de quien las emitió.

### Recorrido manual de HU-04
8. **Cadena y estados:** abre `http://localhost:3000/malla` y selecciona **MAT102**. MAT101 debe verse verde (aprobada) y resaltada como prerrequisito; MAT102 debe verse azul (disponible) y distinguida como seleccionada; ECU301 debe verse gris (bloqueada) y resaltada como dependiente; el resto de las asignaturas debe verse atenuado. El resumen debe listar «Prerrequisitos: MAT101 Cálculo I» y «Dependientes: ECU301 Ecuaciones Diferenciales».
9. **Sin prerrequisitos:** selecciona **MAT101**. El resumen debe decir «Sin prerrequisitos» y listar como dependientes MAT102 y ECU301; ING101 debe mostrar la etiqueta «En curso» sin un cuarto color.

### Estructura
```text
src/app.ts                  # aplicación Express (sin escuchar, para pruebas)
src/server.ts               # arranca el servidor en el puerto 3000
src/db/conexion.ts          # SQLite + migraciones
src/db/migrations/          # migraciones SQL numeradas
src/db/seed.ts              # datos de ejemplo idempotentes
src/dominio/                # tipos, horario, métricas, malla y repositorios
src/servicios/simulacion.ts # alta, baja, créditos y validaciones
src/rutas/planificador.ts   # rutas y mensajes del planificador
src/rutas/malla.ts          # ruta GET /malla y cadena de prerrequisitos
src/vistas/                 # plantillas EJS
tests/                      # pruebas Vitest + supertest
```

### Notas
- No hay autenticación real: la cabecera tiene un selector de rol de demostración.
- RP-11 se aplica solo como anonimato (no se guarda ni muestra la identidad); el resto de los requisitos no funcionales se leen como contexto y no se implementan.
- La malla es de solo lectura: no registra ni modifica el avance curricular; el «En curso» es una etiqueta, no un cuarto color.
- Fuera de alcance: registrar evaluaciones o moderar comentarios (RP-12), carga de Excel (HU-01), tiempo restante de titulación (HU-05), correquisitos y confirmar/exportar la simulación.
