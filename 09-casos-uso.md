# Casos de uso
## Historia de origen:
HU-01: Carga y Traducción de Oferta Académica en Excel
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano | Sube la planilla y confirma datos para el simulador |
|Administrador| Humano | Mismo rol que estudiante|
|Sistema de la Universidad| Sistema externo | Entrega la fuente con la oferta académica|
 
## Diagrama de casos de uso
![Casos de uso](./diagramas/casos-de-uso.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/casos-de-uso.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-01 | Cargar planilla | Estudiante, Admin. comunitario, Sistema Universidad | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-02 | Validar datos parseados | Estudiante, Admin. comunitario, Sistema Universidad  | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-03 | Previsualizar datos | Estudiante y administrador | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-04 | Confirmar datos | Estudiante y administrador | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-05 | Simular horario semestral | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |

# Caso de uso 2
## Historia de origen:
HU-02: Planificador en Grilla Interactiva
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano |Simula combinaciones de horario en la grilla y revisa su carga académica |

 
## Diagrama de casos de uso
![Casos de uso](./diagramas/CU-02.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/CU-02.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-06 | Agregar sección a grilla horaria | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-07 | Remover sección de la grilla horaria | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-08 | Consultar créditos totales de la carga académica | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-09 | Advertir choque de horario | - | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-10 | Advertir exceso del tope crediticio | -| [HU-02](./04-historias-usuario.md#hu-02) |

# ! Estos fueron añadidos después de la fecha de entrega
HU-03: Consulta de Referencias Comunitaria y Dificultad Docente
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano | Consulta la valoración de los docentes y la dificultad de cada materia para decidir su horario |

 
## Diagrama de casos de uso
![Casos de uso](./diagramas/CU-03.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/CU-03.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-11 | Consultar valoración comunitaria del docente | Estudiante | [HU-03](./04-historias-usuario.md#hu-03) |
| CU-12 | Consultar nivel de dificultad de la asignatura | Estudiante | [HU-03](./04-historias-usuario.md#hu-03) |

HU-04: Malla Interactiva y Cadena Crítica Curricular
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano | Explora la malla interactiva y consulta los prerrequisitos de una asignatura |

 
## Diagrama de casos de uso
![Casos de uso](./diagramas/CU-04.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/CU-04.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-13 | Visualizar malla interactiva con estado de asignaturas | Estudiante | [HU-04](./04-historias-usuario.md#hu-04) |
| CU-14 | Consultar cadena de prerrequisitos de una asignatura | Estudiante | [HU-04](./04-historias-usuario.md#hu-04) |

HU-05: Estimación del Tiempo Restante de Titulación
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano | Consulta cuántos semestres le faltan para titularse y simula escenarios de retraso |

 
## Diagrama de casos de uso
![Casos de uso](./diagramas/CU-05.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/CU-05.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-14 | Consultar semestres mínimos restantes para titularse | Estudiante | [HU-05](./04-historias-usuario.md#hu-05) |
| CU-15 | Simular reprobación o postergación de una asignatura | Estudiante | [HU-05](./04-historias-usuario.md#hu-05) |





