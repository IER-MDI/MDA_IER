# malla-curricular Specification

## Purpose

Permite al estudiante consultar la malla de su carrera, ver el estado de cada asignatura y desplegar la red completa de prerrequisitos y asignaturas dependientes de una asignatura seleccionada, para entender el impacto curricular de aprobar o reprobar un curso.

## Requirements

### Requirement: Mostrar la malla con el estado de cada asignatura

El sistema SHALL mostrar la malla de la carrera agrupada por semestre sugerido, con cada asignatura en estado **aprobada**, **disponible** o **bloqueada**. Está aprobada si el estudiante tiene un avance con resultado «aprobada»; disponible si no está aprobada y todos sus prerrequisitos están aprobados (incluida una reprobada con prerrequisitos aprobados); y bloqueada si no está aprobada y algún prerrequisito no lo está. Solo «aprobada» satisface un prerrequisito.

#### Scenario: Una asignatura con prerrequisitos y dependientes muestra su cadena y su estado

- **GIVEN** un estudiante de una carrera cuya malla indica que Cálculo I es prerrequisito de Cálculo II
- **AND** que Cálculo II es prerrequisito de Ecuaciones Diferenciales
- **AND** que el estudiante aprobó Cálculo I y no ha aprobado las otras dos
- **WHEN** el estudiante consulta Cálculo II
- **THEN** el sistema señala Cálculo I como prerrequisito y Ecuaciones Diferenciales como asignatura que depende de Cálculo II
- **AND** Cálculo I se presenta como aprobada, Cálculo II como disponible y Ecuaciones Diferenciales como bloqueada

### Requirement: Resaltar la red transitiva y mostrar la etiqueta del resultado

El sistema SHALL mostrar el resultado «en curso» como etiqueta, sin un cuarto color. Al seleccionar una asignatura, SHALL resaltar la red transitiva de prerrequisitos (hacia atrás) y de dependientes (hacia adelante), distinguir la asignatura seleccionada de su cadena, atenuar las asignaturas no relacionadas y mantener visible el color de estado de cada asignatura de la red.

#### Scenario: Una asignatura con prerrequisitos y dependientes muestra su cadena y su estado

- **GIVEN** un estudiante de una carrera cuya malla indica que Cálculo I es prerrequisito de Cálculo II
- **AND** que Cálculo II es prerrequisito de Ecuaciones Diferenciales
- **AND** que el estudiante aprobó Cálculo I y no ha aprobado las otras dos
- **WHEN** el estudiante consulta Cálculo II
- **THEN** el sistema señala Cálculo I como prerrequisito y Ecuaciones Diferenciales como asignatura que depende de Cálculo II
- **AND** Cálculo I se presenta como aprobada, Cálculo II como disponible y Ecuaciones Diferenciales como bloqueada

### Requirement: Informar cuando una asignatura no tiene prerrequisitos

El sistema SHALL informar que una asignatura no tiene prerrequisitos cuando no existen asignaturas que la precedan, y SHALL señalar todas las asignaturas que dependen de ella.

#### Scenario: Una asignatura sin prerrequisitos muestra solo las asignaturas que dependen de ella

- **GIVEN** una asignatura del primer semestre que no tiene prerrequisitos
- **WHEN** el estudiante consulta esa asignatura
- **THEN** el sistema informa que no tiene prerrequisitos
- **AND** señala todas las asignaturas que dependen de ella
