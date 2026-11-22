# referencias-comunitarias Specification

## Purpose

Permite al estudiante consultar la valoración comunitaria de los docentes y la dificultad de las asignaturas dentro del planificador, usando promedios de evaluaciones anónimas.

## Requirements

### Requirement: Mostrar la valoración docente y la dificultad de una sección con evaluaciones
El sistema SHALL mostrar, para cada sección del planificador, la valoración promedio del docente y la dificultad promedio de la asignatura, calculadas a partir de las evaluaciones de esa asignatura emitidas para ese docente y redondeadas a un decimal. La valoración SHALL mostrarse con estrellas y número, la dificultad con número, y el sistema SHALL NOT revelar la identidad de quien emitió cada evaluación.

#### Scenario: Una sección con evaluaciones muestra la valoración del docente y la dificultad de la asignatura
- **GIVEN** un docente que ha recibido evaluaciones de 5, 3 y 4 en una escala de 1 a 5
- **AND** una asignatura con evaluaciones de dificultad percibida de 4, 4 y 5 en una escala de 1 a 5
- **WHEN** el estudiante consulta una sección de esa asignatura dictada por ese docente
- **THEN** el sistema muestra una valoración del docente de 4,0
- **AND** muestra una dificultad percibida de la asignatura de 4,3
- **AND** no revela quién emitió cada evaluación

### Requirement: Informar cuando una sección no tiene evaluaciones
El sistema SHALL informar que todavía no hay evaluaciones disponibles cuando una sección no tiene evaluaciones para su asignatura y docente, y SHALL NOT mostrar ninguna valoración, indicador de dificultad ni valor por defecto.

#### Scenario: Una sección sin evaluaciones no muestra valores inventados
- **GIVEN** un docente que aún no ha recibido evaluaciones
- **WHEN** el estudiante consulta una sección dictada por ese docente
- **THEN** el sistema informa que todavía no hay evaluaciones disponibles
- **AND** no muestra ninguna valoración ni indicador de dificultad
