# Casos de uso
## Historia de origen:
HU-01: Carga y Traducción de Oferta Académica en Excel
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante o administrador comunitario | Humano | Sube la planilla, revisa el mapeo y confirma los datos para el simulador |
| Sistema de la Universidad | Sistema externo | Publica la planilla de oferta; es un sistema externo antecedente, sin mensajes en DSS-01 |
 
## Diagrama de casos de uso
![Casos de uso](./diagramas/casos-de-uso.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/casos-de-uso.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-01 | Cargar planilla | Estudiante o administrador comunitario | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-02 | Validar datos parseados | Estudiante o administrador comunitario | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-03 | Previsualizar datos | Estudiante o administrador comunitario | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-04 | Confirmar datos | Estudiante o administrador comunitario | [HU-01](./04-historias-usuario.md#hu-01) |

## Relación con las otras historias
- **CU-01…CU-04 (HU-01)** publican la oferta activa que consumen **CU-05…CU-10 (HU-02)** y cuyas asignaturas y docentes alimentan las métricas de **CU-11/CU-12 (HU-03)**.
- La identidad de **Asignatura** se conserva por código: **CU-13/CU-14 (HU-04)** y **CU-15/CU-16 (HU-05)** siguen leyendo la misma malla y el mismo avance. HU-01 no modifica la malla, los prerrequisitos ni `Asignatura Cursada`.
- Una asignatura nueva queda disponible en la oferta y el simulador, pero no se incorpora automáticamente a la malla.

# Caso de uso 2
## Historia de origen:
HU-02: Planificador en Grilla Interactiva
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano |Simula combinaciones de horario en la grilla y revisa su carga académica |

 
## Diagrama de casos de uso
![Casos de uso](./diagramas/CU-02(Eval2).png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/CU-02(Eval2).drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-05 | Simular horario semestral | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-06 | Confirmar asignatura tentativa desde el planificcador| Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-06 | Agregar sección a grilla horaria | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-07 | Remover sección de la grilla horaria | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-08 | Consultar créditos totales de la carga académica | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-09 | Advertir choque de horario | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |
| CU-10 | Advertir exceso del tope crediticio | Estudiante | [HU-02](./04-historias-usuario.md#hu-02) |

# ! Estos fueron añadidos después de la fecha de entrega
## HU-03: Consulta de Referencias Comunitaria y Dificultad Docente
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

## HU-04: Malla Interactiva y Cadena Crítica Curricular
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
| CU-14 | Marcar asignatura como tentativa en malla | Estudiante | [HU-04](./04-historias-usuario.md#hu-04) |
| CU-15 | Consultar cadena de prerrequisitos de una asignatura | Estudiante | [HU-04](./04-historias-usuario.md#hu-04) |

## HU-05: Estimación del Tiempo Restante de Titulación
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
| CU-16 | Consultar semestres mínimos restantes para titularse | Estudiante | [HU-05](./04-historias-usuario.md#hu-05) |
| CU-17 | Simular reprobación o postergación de una asignatura | Estudiante | [HU-05](./04-historias-usuario.md#hu-05) |





