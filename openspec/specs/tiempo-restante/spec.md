# tiempo-restante Specification

## Purpose

Permite al estudiante consultar cuántos semestres le faltan como mínimo para titularse según la ruta crítica de sus asignaturas pendientes, y simular la reprobación o postergación de una asignatura para ver el retraso producido.

## Requirements

### Requirement: Calcular el mínimo de semestres restantes desde el avance

El sistema SHALL calcular el mínimo estimado de semestres como la longitud de la cadena más larga de asignaturas pendientes unidas por la relación «es prerrequisito de», donde cada asignatura sucesiva agrega un semestre. Una asignatura se considera pendiente cuando el avance del estudiante no registra un resultado `aprobada` para ella. El sistema SHALL mostrar el mínimo estimado en semestres.

#### Scenario: El sistema estima el mínimo de semestres restantes a partir del avance

- **GIVEN** un estudiante cuyas asignaturas pendientes forman como máxima cadena de prerrequisitos 4 asignaturas sucesivas
- **WHEN** el estudiante consulta el tiempo restante para titularse
- **THEN** el sistema informa que el mínimo estimado es de 4 semestres

### Requirement: Simular reprobación o postergación de una asignatura

El sistema SHALL permitir seleccionar una asignatura pendiente y simular «Reprobar» o «Postergar» con el mismo efecto. Si la asignatura pertenece a alguna cadena más larga de prerrequisitos pendientes, el sistema SHALL aumentar el mínimo en 1 semestre e informar un retraso de 1 semestre; en caso contrario SHALL mantener el mínimo e informar un retraso de 0 semestres. La simulación SHALL mostrarse sin guardarse en la base de datos.

#### Scenario: Simular la reprobación de una asignatura crítica aumenta el tiempo restante

- **GIVEN** un estudiante con un mínimo estimado de 4 semestres restantes
- **AND** una asignatura que pertenece a la cadena más larga de prerrequisitos pendientes
- **WHEN** el estudiante simula reprobar esa asignatura
- **THEN** el sistema informa que el mínimo estimado pasa a 5 semestres
- **AND** señala que el retraso es de 1 semestre

#### Scenario: Simular una asignatura que no es crítica no cambia el mínimo

- **GIVEN** un estudiante con un mínimo estimado de 4 semestres restantes
- **AND** una asignatura pendiente que no pertenece a la cadena más larga de prerrequisitos
- **WHEN** el estudiante simula postergar esa asignatura
- **THEN** el sistema mantiene el mínimo estimado en 4 semestres
- **AND** señala que el retraso es de 0 semestres
