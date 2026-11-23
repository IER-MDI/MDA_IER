# carga-oferta-academica Specification

## Purpose

Permite al estudiante o administrador comunitario cargar la planilla de oferta académica publicada por la universidad, traducirla a una estructura de oferta, secciones y asignaturas, revisar y corregir el mapeo de columnas y publicar la oferta resultante para que el simulador de horarios la consuma y las historias de referencias, malla y tiempo restante sigan usando las mismas asignaturas.

## Requirements

### Requirement: Interpretar una planilla válida como secciones de la oferta
El sistema SHALL aceptar archivos `.xlsx` o `.csv` seleccionados o arrastrados, e interpretar cada fila como una sección de una asignatura con código, nombre, número de sección, docente, bloques horarios, créditos, cupos y semestre sugerido. Antes de confirmar, el sistema SHALL mostrar la vista previa con el mapeo de columnas y el detalle de cada sección interpretada.

#### Scenario: Una planilla de oferta académica válida se incorpora al sistema
- **GIVEN** una planilla de oferta académica en formato Excel o CSV, publicada por la universidad para el período 2026-2
- **AND** la planilla indica, para cada sección, el código y nombre de la asignatura, el número de sección, el docente, los bloques horarios, los créditos, los cupos y el semestre sugerido
- **WHEN** el estudiante o administrador comunitario carga la planilla
- **THEN** el sistema interpreta cada fila como una sección de una asignatura, con su docente, sus bloques horarios, sus créditos, sus cupos y su semestre sugerido
- **AND** el sistema muestra la vista previa con el mapeo de columnas y el detalle de cada sección interpretada antes de confirmarlos

### Requirement: Informar y excluir las filas no interpretables
El sistema SHALL informar el número de fila y el motivo de cada fila que no pueda interpretar —sin código, sin bloques horarios, sección duplicada, o crédito, cupo o semestre inválido— y SHALL NOT incorporarla a la oferta académica. La confirmación de la exclusión de esas filas SHALL contar como la acción `corregirMapeo` del EST-01.

#### Scenario: Una planilla con filas que no se pueden interpretar
- **GIVEN** una planilla de oferta académica en la que algunas filas no tienen código de asignatura o bloques horarios
- **WHEN** el estudiante o administrador comunitario carga la planilla
- **THEN** el sistema informa el número de fila y el motivo de cada una
- **AND** esas filas no se incorporan a la oferta académica
- **AND** al confirmar la exclusión de esas filas, el sistema continúa con el mapeo y la validación de las filas restantes

### Requirement: Rechazar los formatos de archivo no admitidos
El sistema SHALL verificar el formato del archivo cargado y, si no es `.xlsx` ni `.csv`, SHALL informar el error de formato, SHALL NOT incorporar el archivo y SHALL dejar la oferta en el estado `Rechazada` de EST-01.

#### Scenario: Un archivo con formato no admitido es rechazado
- **GIVEN** un archivo que no es Excel (.xlsx) ni CSV (.csv)
- **WHEN** el estudiante o administrador comunitario intenta cargarlo
- **THEN** el sistema informa que el formato no es admitido
- **AND** el archivo no se incorpora a la oferta académica

### Requirement: Corregir el mapeo de columnas y revalidar la planilla
El sistema SHALL permitir al usuario corregir la correspondencia entre las columnas de la planilla y los campos del sistema, reprocesar y revalidar los datos, y actualizar la vista previa con las filas que pasen a ser válidas.

#### Scenario: La corrección del mapeo permite incorporar filas antes excluidas
- **GIVEN** una planilla cargada cuyas columnas de docente y bloques horarios fueron mapeadas incorrectamente
- **AND** el sistema informó las filas que no pudo interpretar
- **WHEN** el estudiante o administrador comunitario corrige el mapeo de esas columnas
- **THEN** el sistema reprocesa y revalida la planilla
- **AND** las filas antes excluidas pasan a mostrarse en la vista previa si ahora son válidas

### Requirement: Publicar la oferta académica confirmada
El sistema SHALL guardar, al confirmar, la oferta del período indicado en la planilla con `fechaPublicacion` asignada por el sistema, junto con sus asignaturas, secciones y bloques horarios, y SHALL dejarla disponible en el simulador de horarios, quedando en el estado `Publicada` de EST-01.

#### Scenario: La confirmación publica la oferta y la deja disponible en el simulador
- **GIVEN** una planilla con datos y mapeo válidos y al menos una sección interpretada
- **AND** el sistema muestra la vista previa definitiva
- **WHEN** el estudiante o administrador comunitario confirma la oferta académica
- **THEN** el sistema guarda la oferta del período indicado en la planilla, con fecha de publicación asignada por el sistema, junto con sus asignaturas, secciones y bloques horarios
- **AND** la oferta queda disponible en el simulador de horarios

#### Scenario: El período de la planilla ya está publicado
- **GIVEN** una oferta académica ya publicada para el período 2026-2
- **WHEN** el estudiante o administrador comunitario carga una planilla para ese mismo período
- **THEN** el sistema informa que la oferta de ese período ya está publicada
- **AND** no incorpora una segunda oferta para el mismo período

#### Scenario: Ninguna fila válida impide publicar la oferta
- **GIVEN** una planilla en la que todas las filas no se pueden interpretar
- **WHEN** el estudiante o administrador comunitario carga la planilla
- **THEN** el sistema informa que no hay secciones válidas
- **AND** la oferta académica no se publica

### Requirement: No publicar la oferta al cancelar o al quedar errores
El sistema SHALL NOT publicar la oferta ni dejarla disponible en el simulador cuando el usuario cancela la carga o cuando quedan inconsistencias sin resolver.

#### Scenario: La cancelación o los errores pendientes impiden publicar la oferta
- **GIVEN** una planilla cargada con vista previa y mapeo en revisión
- **WHEN** el estudiante o administrador comunitario cancela la carga o quedan inconsistencias sin resolver
- **THEN** el sistema no publica la oferta académica
- **AND** la oferta no queda disponible en el simulador

### Requirement: Integrar la oferta publicada con el simulador de HU-02
El sistema SHALL convertir la oferta recién publicada en la oferta activa que consume el simulador, SHALL retirar de la simulación las secciones de ofertas anteriores, y SHALL conservar la identidad de las asignaturas existentes para que las evaluaciones de HU-03 sigan asociadas.

#### Scenario: La oferta publicada se convierte en la oferta activa del simulador
- **GIVEN** una oferta publicada para el período 2026-2 con una sección de MAT101 y una simulación que la incluye
- **WHEN** el estudiante o administrador comunitario publica una oferta válida para el período 2026-3
- **THEN** el simulador muestra las secciones de la oferta 2026-3
- **AND** deja de mostrar las secciones de la oferta 2026-2
- **AND** la simulación ya no incluye la sección de 2026-2
- **AND** la sección de MAT101 de 2026-3 conserva la valoración y la dificultad de las evaluaciones existentes si coinciden la asignatura y el docente

### Requirement: Conservar la malla y el avance de HU-04/HU-05
El sistema SHALL conservar la identidad de las asignaturas reutilizadas por código para que la malla de HU-04 y el avance de HU-05 sigan asociados, y SHALL NOT modificar `carrera_asignatura`, `asignatura_prerrequisito` ni `asignatura_cursada`. Las asignaturas nuevas SHALL quedar disponibles en la oferta y el simulador, pero SHALL NOT incorporarse automáticamente a la malla.

#### Scenario: Publicar una oferta no modifica la malla ni el avance
- **GIVEN** una malla con 13 asignaturas y 7 prerrequisitos
- **AND** un avance del estudiante demo
- **WHEN** se publica una oferta válida que reutiliza MAT101 y agrega una asignatura nueva
- **THEN** la malla sigue teniendo 13 asignaturas y 7 prerrequisitos
- **AND** el avance del estudiante no cambia
- **AND** la asignatura nueva queda disponible en el simulador pero no se incorpora a la malla
- **AND** el mínimo de semestres restantes no cambia
