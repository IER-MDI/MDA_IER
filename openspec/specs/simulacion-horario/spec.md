# simulacion-horario Specification

## Purpose

Permite al estudiante simular su horario semestral sobre la oferta académica publicada, con una grilla semanal, el total de créditos de su carga y la validación inmediata de choques de horario y del tope de créditos de su carrera.

## Requirements

### Requirement: Agregar una sección a la simulación activa
El sistema SHALL permitir al estudiante agregar una sección de la oferta publicada a su simulación activa, incorporándola a la grilla e incrementando el total de créditos con los créditos de la asignatura de esa sección, siempre que la sección no genere un choque de horario ni supere el tope de créditos de la carrera. Si el estudiante no tiene una simulación activa, el sistema SHALL crear una vacía en estado «en armado».

#### Scenario: Agregar una sección a la simulación actualiza la carga de créditos
- **GIVEN** un estudiante con una simulación de horario que incluye una sección de 5 créditos
- **AND** una sección de 6 créditos cuyos bloques horarios no coinciden con los de la simulación
- **AND** el tope de créditos de su carrera es 30
- **WHEN** el estudiante agrega la sección de 6 créditos a la simulación
- **THEN** la simulación incluye ambas secciones
- **AND** el total de créditos de la simulación es 11

### Requirement: Detectar choques de horario al agregar una sección
El sistema SHALL comparar los bloques horarios de la sección que se quiere agregar con los bloques de las secciones ya incluidas en la simulación. Si dos bloques coinciden en día y se solapan en el tiempo, el sistema SHALL informar con qué sección existe el choque y SHALL NOT incorporar la sección solicitada.

#### Scenario: Una sección que choca en horario con la simulación es advertida
- **GIVEN** un estudiante con una simulación que incluye una sección con un bloque el lunes de 08:30 a 09:50
- **AND** otra sección con un bloque el lunes de 09:00 a 10:20
- **WHEN** el estudiante intenta agregar la segunda sección
- **THEN** el sistema informa que existe un choque de horario con la primera sección
- **AND** la segunda sección no se incorpora a la simulación

### Requirement: Controlar el tope de créditos de la carrera
El sistema SHALL comparar el total de créditos que resultaría de agregar una sección con el tope de créditos por semestre de la carrera del estudiante. Si el total superara el tope, el sistema SHALL informar que se superaría el tope y SHALL NOT incorporar la sección, manteniendo el total de créditos anterior.

#### Scenario: Una sección que supera el tope de créditos es advertida
- **GIVEN** un estudiante con una simulación de 28 créditos
- **AND** el tope de créditos de su carrera es 30
- **WHEN** el estudiante intenta agregar una sección de 5 créditos
- **THEN** el sistema informa que se superaría el tope de créditos
- **AND** el total de créditos de la simulación sigue siendo 28

### Requirement: Remover una sección de la simulación
El sistema SHALL permitir al estudiante remover una sección incluida en su simulación activa; al hacerlo, la sección SHALL dejar de mostrarse en la grilla y el total de créditos SHALL recalcularse con las secciones restantes.

#### Scenario: Remover una sección recalcula la carga de créditos
- **GIVEN** un estudiante con una simulación que incluye una sección de 5 créditos y otra de 6 créditos
- **WHEN** el estudiante remueve la sección de 6 créditos
- **THEN** la simulación deja de incluir esa sección
- **AND** el total de créditos de la simulación es 5

### Requirement: Mantener actualizada la oferta disponible

El sistema SHALL excluir del listado de secciones de la oferta académica las secciones incluidas en la simulación activa del estudiante, y SHALL volver a incluirlas en ese listado cuando el estudiante las remueva de su simulación.

#### Scenario: Una sección de la simulación deja de ofrecerse y vuelve al removerla

- **GIVEN** un estudiante con una simulación de horario
- **WHEN** el estudiante agrega una sección de la oferta a su simulación
- **THEN** la sección deja de mostrarse en el listado de secciones de la oferta académica
- **AND** la sección aparece en las secciones de su simulación
- **WHEN** el estudiante remueve esa sección de su simulación
- **THEN** la sección vuelve a mostrarse en el listado de secciones de la oferta académica
