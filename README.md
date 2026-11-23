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

## Aplicación web (HU-01 — Carga de oferta · HU-02 — Planificador · HU-03 — Referencias comunitarias · HU-04 — Malla interactiva · HU-05 — Tiempo restante)

Aplicación TypeScript + Express + EJS con SQLite. Implementa la carga y traducción de planillas de HU-01, la simulación de horario de HU-02, la consulta de valoración docente y dificultad de HU-03, la malla interactiva con cadena de prerrequisitos de HU-04 y la estimación de semestres restantes de HU-05. Sin una carga nueva, el simulador usa los datos de ejemplo de la oferta 2026-2; al publicar una planilla, esa oferta pasa a ser la oferta activa.

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

Corre las pruebas de los escenarios Gherkin de HU-01 a HU-05: carga y traducción de planillas (CSV/XLSX), estados de EST-01, publicación de la oferta activa, remoción de secciones, solapamiento de bloques, promedios de evaluaciones, estado y cadena de la malla, ruta crítica de prerrequisitos, integración entre historias y rutas HTTP.

### Carga de oferta (HU-01)
En `http://localhost:3000/carga` se sube una planilla `.xlsx` o `.csv` (también se puede arrastrar). El flujo muestra el mapeo de columnas editable, la vista previa de las secciones interpretadas y las filas inválidas con número de fila y motivo. Hay una planilla de ejemplo descargable en esa pantalla (`datos/ejemplo-oferta-2026-3.csv`), que simula la publicación de la Universidad.

Al publicar, la oferta queda en estado **Publicada** y pasa a ser la oferta activa del simulador. Si la simulación tenía secciones de una oferta anterior, se retiran para no mezclar períodos; las asignaturas se reutilizan por código, de modo que las evaluaciones, la malla y el avance siguen asociados. Una asignatura nueva no se agrega automáticamente a la malla.

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
| ECU301 Ecuaciones Diferenciales Aplicadas | 6 | sin sección (solo malla) |

Evaluaciones de ejemplo, anónimas y sin vínculo con el estudiante:

| Asignatura | Docente | Calificación | Dificultad |
|------------|---------|--------------|------------|
| MAT101 Cálculo I | Prof. Ana Pérez | 5 | 4 |
| MAT101 Cálculo I | Prof. Ana Pérez | 3 | 4 |
| MAT101 Cálculo I | Prof. Ana Pérez | 4 | 5 |

MAT101 queda con **4,0** de valoración docente y **4,3** de dificultad. MAT102, dictada por la misma docente, no tiene evaluaciones y muestra «Sin evaluaciones».

### Malla y avance de ejemplo (HU-04 y HU-05)

La malla tiene 13 asignaturas: las 8 de la oferta más ECU301, MAT201, MAT202, MAT301 y MAT401, todas sin sección excepto las de la oferta. Prerrequisitos: **MAT101 → MAT102 → ECU301**, **MAT101 → MAT102 → MAT202** (con **MAT201 → MAT202**) **→ MAT301 → MAT401** y **PROG101 → BD101**.

| Dato | Valores |
|------|---------|
| Aprobadas | MAT101 Cálculo I, MAT201 Álgebra Lineal, FIS101 Física I, PROG101 Programación |
| En curso | ING101 Inglés Técnico (etiqueta, sin cuarto color) |
| Sin registro | MAT102, ECU301, MAT202, MAT301, MAT401, BD101, ECO101, HUM101 |

La cadena pendiente más larga es `MAT102 Cálculo II → MAT202 Ecuaciones Diferenciales → MAT301 Análisis Numérico → MAT401 Proyecto de Título`. Como son 4 asignaturas sucesivas, el mínimo estimado es de **4 semestres**. ECU301 y BD101 son pendientes cortos (no críticos): postergarlos no cambia el mínimo.

### Recorrido manual de HU-01
1. **Carga:** abre `/carga`, descarga la planilla de ejemplo y súbela. Debes ver las columnas mapeadas, dos secciones válidas (MAT101 y NUEV101) y el error «Fila 4 — sin código».
2. **Corrección y exclusión:** pulsa «Aplicar mapeo y validar» y luego «Confirmar exclusión y continuar». La oferta queda en estado **Estructurada**.
3. **Publicación:** pulsa «Confirmar y publicar oferta». El planificador debe mostrar la oferta 2026-3; la simulación queda vacía.
4. **Integración:** MAT101 / Prof. Ana Pérez sigue mostrando **4,0 de 5** y **4,3 de 5**; NUEV101 muestra «Sin evaluaciones». La malla sigue con 13 asignaturas y el mínimo de HU-05 en 4 semestres.

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
8. **Cadena y estados:** abre `http://localhost:3000/malla` y selecciona **MAT102**. MAT101 debe verse verde (aprobada) y resaltada como prerrequisito; MAT102 debe verse azul (disponible) y distinguida como seleccionada; ECU301 y MAT202 deben verse grises (bloqueadas) y resaltadas como dependientes; el resto de las asignaturas debe verse atenuado. El resumen debe listar «Prerrequisitos: MAT101 Cálculo I» y como dependientes ECU301 y MAT202 (y, por transitividad, MAT301 y MAT401).
9. **Sin prerrequisitos:** selecciona **MAT101**. El resumen debe decir «Sin prerrequisitos» y listar como dependientes MAT102, ECU301, MAT202, MAT301 y MAT401; ING101 debe mostrar la etiqueta «En curso» sin un cuarto color.

### Recorrido manual de HU-05
10. **Mínimo:** desde el planificador pulsa «Tiempo restante para titularse» (o abre `http://localhost:3000/tiempo-restante`). Debe mostrar **Mínimo estimado: 4 semestres** y MAT102, MAT202, MAT301 y MAT401 marcadas como críticas.
11. **Simular reprobación:** selecciona MAT202, deja «Reprobar» y pulsa «Simular». El mínimo debe pasar a **5 semestres** y aparecer **Retraso: 1 semestre**.
12. **Simular postergación no crítica:** selecciona BD101, elige «Postergar» y pulsa «Simular». El mínimo vuelve a **4 semestres** y el retraso es **0**. La simulación no se guarda: al volver a `/tiempo-restante` reaparece el valor base.

### Estructura
```text
src/app.ts                  # aplicación Express (sin escuchar, para pruebas)
src/server.ts               # arranca el servidor en el puerto 3000
src/db/conexion.ts          # SQLite + migraciones
src/db/migrations/          # migraciones SQL numeradas
src/db/seed.ts              # datos de ejemplo idempotentes
datos/                      # planilla de ejemplo de la Universidad simulada
src/dominio/                # tipos, horario, métricas, malla, ruta crítica, estados y repositorios
src/servicios/leerPlanilla.ts    # adaptador CSV/XLSX
src/servicios/parsearOferta.ts   # mapeo, validación y bloques horarios
src/servicios/publicarOferta.ts  # EST-01, borradores y publicación
src/servicios/simulacion.ts      # alta, baja, créditos y validaciones
src/rutas/carga.ts          # rutas y mensajes de HU-01
src/rutas/planificador.ts   # rutas y mensajes del planificador
src/rutas/malla.ts          # ruta GET /malla y cadena de prerrequisitos
src/rutas/tiempo-restante.ts # consulta y simulación de semestres restantes
src/vistas/                 # plantillas EJS
tests/                      # pruebas Vitest + supertest
```

### Notas
- No hay autenticación real: la cabecera tiene un selector de rol de demostración.
- RP-11 se aplica solo como anonimato (no se guarda ni muestra la identidad); el resto de los requisitos no funcionales se leen como contexto y no se implementan.
- La malla es de solo lectura: no registra ni modifica el avance curricular; el «En curso» es una etiqueta, no un cuarto color.
- La simulación de reprobación/postergación de HU-05 no se guarda: viaja en la URL y se recalcula al mostrar la pantalla.
- La oferta publicada por HU-01 es la oferta activa; publicar una nueva retira de la simulación las secciones del período anterior.
- No hay autenticación real: el selector de rol de demostración distingue «Estudiante» de «Administrador comunitario».
- Fuera de alcance: registrar evaluaciones o moderar comentarios (RP-12), correquisitos, agregar asignaturas a la malla desde la planilla y confirmar/exportar la simulación.
