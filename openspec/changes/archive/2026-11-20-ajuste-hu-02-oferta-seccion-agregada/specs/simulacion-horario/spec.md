# Spec Delta — simulacion-horario

## ADDED Requirements

### Requirement: Mantener actualizada la oferta disponible

El sistema SHALL excluir del listado de secciones de la oferta académica las secciones incluidas en la simulación activa del estudiante, y SHALL volver a incluirlas en ese listado cuando el estudiante las remueva de su simulación.

#### Scenario: Una sección de la simulación deja de ofrecerse y vuelve al removerla

- **GIVEN** un estudiante con una simulación de horario
- **WHEN** el estudiante agrega una sección de la oferta a su simulación
- **THEN** la sección deja de mostrarse en el listado de secciones de la oferta académica
- **AND** la sección aparece en las secciones de su simulación
- **WHEN** el estudiante remueve esa sección de su simulación
- **THEN** la sección vuelve a mostrarse en el listado de secciones de la oferta académica
