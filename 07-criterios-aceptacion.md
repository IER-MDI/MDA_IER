# Criterios de aceptación (Gherkin)

## HU-01: Carga y Traducción de Oferta Académica en Excel

Como **estudiante o administrador comunitario**, quiero **subir la planilla Excel publicada por la universidad y validar el mapeo de sus datos**, para **convertir la oferta académica estática en un formato estructurado consumible por la página**.

**Actividad TO-BE asociada:** Sincronizar y publicar oferta y referencias en el sistema

```gherkin
Característica: Carga y traducción de la oferta académica

  Escenario: Una planilla de oferta académica válida se incorpora al sistema
    Dado una planilla de oferta académica en formato Excel o CSV, publicada por la universidad para el período 2026-2
    Y la planilla indica, para cada sección, el código y nombre de la asignatura, el número de sección, el docente y los bloques horarios
    Cuando el estudiante carga la planilla
    Entonces el sistema interpreta cada fila como una sección de una asignatura, con su docente y sus bloques horarios
    Y el estudiante puede revisar los datos interpretados antes de confirmarlos

  Escenario: Una planilla con filas que no se pueden interpretar
    Dado una planilla de oferta académica en la que algunas filas no tienen código de asignatura o bloques horarios
    Cuando el estudiante carga la planilla
    Entonces el sistema informa cuáles filas no pudo interpretar y el motivo de cada una
    Y esas filas no se incorporan a la oferta académica
```

## HU-02: Planificador en Grilla Interactiva

Como **estudiante**, quiero **simular combinaciones de horarios en una grilla interactiva usando los ramos extraídos del Excel**, para **visualizar de forma clara mi carga académica y evitar choques horarios o sobrecarga de créditos**.

**Actividad TO-BE asociada:** Simular horario y revisar métricas de dificultad

```gherkin
Característica: Simulación de horario con control de carga académica

  Escenario: Agregar una sección a la simulación actualiza la carga de créditos
    Dado un estudiante con una simulación de horario que incluye una sección de 5 créditos
    Y una sección de 6 créditos cuyos bloques horarios no coinciden con los de la simulación
    Y el tope de créditos de su carrera es 30
    Cuando el estudiante agrega la sección de 6 créditos a la simulación
    Entonces la simulación incluye ambas secciones
    Y el total de créditos de la simulación es 11

  Escenario: Una sección que choca en horario con la simulación es advertida
    Dado un estudiante con una simulación que incluye una sección con un bloque el lunes de 08:30 a 09:50
    Y otra sección con un bloque el lunes de 09:00 a 10:20
    Cuando el estudiante intenta agregar la segunda sección
    Entonces el sistema informa que existe un choque de horario con la primera sección
    Y la segunda sección no se incorpora a la simulación

  Escenario: Una sección que supera el tope de créditos es advertida
    Dado un estudiante con una simulación de 28 créditos
    Y el tope de créditos de su carrera es 30
    Cuando el estudiante intenta agregar una sección de 5 créditos
    Entonces el sistema informa que se superaría el tope de créditos
    Y el total de créditos de la simulación sigue siendo 28
```

## HU-03: Consulta de Referencias Comunitaria y Dificultad Docente

Como **estudiante**, quiero **ver las calificaciones comunitarias de profesores y el nivel de dificultad atribuido a cada materia**, para **tomar decisiones informadas al armar mi horario**.

**Actividad TO-BE asociada:** Simular horario y revisar métricas de dificultad

```gherkin
Característica: Consulta de valoración docente y dificultad de asignaturas

  Escenario: Una sección con evaluaciones muestra la valoración del docente y la dificultad de la asignatura
    Dado un docente que ha recibido evaluaciones de 5, 3 y 4 en una escala de 1 a 5
    Y una asignatura con evaluaciones de dificultad percibida de 4, 4 y 5 en una escala de 1 a 5
    Cuando el estudiante consulta una sección de esa asignatura dictada por ese docente
    Entonces el sistema muestra una valoración del docente de 4,0
    Y muestra una dificultad percibida de la asignatura de 4,3
    Y no revela quién emitió cada evaluación

  Escenario: Una sección sin evaluaciones no muestra valores inventados
    Dado un docente que aún no ha recibido evaluaciones
    Cuando el estudiante consulta una sección dictada por ese docente
    Entonces el sistema informa que todavía no hay evaluaciones disponibles
    Y no muestra ninguna valoración ni indicador de dificultad
```

## HU-04: Malla Interactiva y Cadena Crítica Curricular

Como **estudiante**, quiero **seleccionar una asignatura en la malla interactiva y desplegar toda su cadena de prerrequisitos**, para **comprender el impacto curricular completo de aprobar o reprobar un curso**.

**Actividad TO-BE asociada:** Consultar malla interactiva y tiempo restante

```gherkin
Característica: Consulta de la cadena de prerrequisitos de una asignatura

  Escenario: Una asignatura con prerrequisitos y dependientes muestra su cadena y su estado
    Dado un estudiante de una carrera cuya malla indica que Cálculo I es prerrequisito de Cálculo II
    Y que Cálculo II es prerrequisito de Ecuaciones Diferenciales
    Y que el estudiante aprobó Cálculo I y no ha aprobado las otras dos
    Cuando el estudiante consulta Cálculo II
    Entonces el sistema señala Cálculo I como prerrequisito y Ecuaciones Diferenciales como asignatura que depende de Cálculo II
    Y Cálculo I se presenta como aprobada, Cálculo II como disponible y Ecuaciones Diferenciales como bloqueada

  Escenario: Una asignatura sin prerrequisitos muestra solo las asignaturas que dependen de ella
    Dado una asignatura del primer semestre que no tiene prerrequisitos
    Cuando el estudiante consulta esa asignatura
    Entonces el sistema informa que no tiene prerrequisitos
    Y señala todas las asignaturas que dependen de ella
```

## HU-05: Estimación del Tiempo Restante de Titulación

Como **estudiante**, quiero **conocer la cantidad mínima estimada de semestres restantes para terminar mi carrera**, para **planificar estratégicamente mi avance académico**.

**Actividad TO-BE asociada:** Consultar malla interactiva y tiempo restante

```gherkin
Característica: Estimación del tiempo restante de titulación

  Escenario: El sistema estima el mínimo de semestres restantes a partir del avance
    Dado un estudiante cuyas asignaturas pendientes forman como máxima cadena de prerrequisitos 4 asignaturas sucesivas
    Cuando el estudiante consulta el tiempo restante para titularse
    Entonces el sistema informa que el mínimo estimado es de 4 semestres

  Escenario: Simular la reprobación de una asignatura crítica aumenta el tiempo restante
    Dado un estudiante con un mínimo estimado de 4 semestres restantes
    Y una asignatura que pertenece a la cadena más larga de prerrequisitos pendientes
    Cuando el estudiante simula reprobar esa asignatura
    Entonces el sistema informa que el mínimo estimado pasa a 5 semestres
    Y señala que el retraso es de 1 semestre
```
    
