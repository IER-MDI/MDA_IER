# Modelo de dominio

## Diagrama

![Modelo de dominio](./diagramas/modelo-dominio.png)

Archivo fuente: [`./diagramas/modelo-dominio.puml`](./diagramas/modelo-dominio.puml)

## Descripción de las clases

| Clase | Qué representa en el negocio | Atributos |
|-------|------------------------------|-----------|
| Estudiante | Persona que usa el sistema para planificar su inscripción y su avance curricular. | nombre, rut |
| Carrera | Programa de estudios del estudiante; su malla reúne las asignaturas y fija la duración y el tope de créditos por semestre. | nombre, duracionSemestres, topeCreditosSemestre |
| Asignatura | Ramo de la malla curricular, independiente del período en que se ofrece. | codigo, nombre, creditos, semestreSugerido |
| Asignatura Cursada | Registro del resultado de un estudiante en una asignatura; conforma su avance curricular y el tiempo restante para egresar. | resultado (aprobada, reprobada, en curso), periodo |
| Oferta Académica | Conjunto de secciones que la Administración docente publica en la planilla de un período y que el administrador comunitario sincroniza y publica en el sistema. | periodo, fechaPublicacion |
| Sección | Una oferta concreta de una asignatura dentro de la oferta académica, con su docente, sus cupos y su horario semanal. | numero, cupos, docente, horario |
| Simulación de Horario | Horario simulado: combinación de secciones que un estudiante arma para evaluar su carga y sus choques, y que puede confirmar para su inscripción. | nombre, creditosTotales, estado |
| Evaluación | Opinión anónima sobre un docente y la dificultad percibida de una asignatura; alimenta las métricas de dificultad. | docente, calificacionDocente, dificultadPercibida, comentario |

## Asociaciones

| Asociación | Clases | Multiplicidades | Justificación |
|------------|--------|-----------------|----------------|
| cursa | Estudiante – Carrera | 0..* a 1 | Cada estudiante pertenece a una carrera; una carrera tiene muchos estudiantes. |
| tiene en su malla | Carrera – Asignatura | 1..* a 1..* | La malla de una carrera reúne varias asignaturas, y una asignatura puede formar parte de más de una carrera. |
| tiene en su avance | Estudiante – Asignatura Cursada | 1 a 0..* | El avance curricular de un estudiante se compone de los resultados que ha obtenido. |
| corresponde a | Asignatura Cursada – Asignatura | 0..* a 1 | Cada registro de avance se refiere a una sola asignatura. |
| contiene | Oferta Académica – Sección | 1 a 1..* | Una oferta se compone de al menos una sección y cada sección pertenece a una sola oferta. |
| es una oferta de | Sección – Asignatura | 0..* a 1 | Una asignatura puede ofrecerse en varias secciones; cada sección es de una sola asignatura. |
| arma | Estudiante – Simulación de Horario | 1 a 0..* | Un estudiante puede guardar varias simulaciones para compararlas. |
| incluye | Simulación de Horario – Sección | 0..* a 0..* | Una simulación reúne varias secciones, y una sección puede estar en simulaciones de distintos estudiantes. |
| valora la dificultad de | Evaluación – Asignatura | 0..* a 1 | Cada evaluación indica la dificultad percibida de una asignatura. |
| es prerrequisito de | Asignatura – Asignatura | 0..* a 0..* | Una asignatura puede exigir varias asignaturas previas, y puede ser exigida por varias otras. |

## Decisiones de modelado

- **Roles administrativos:** La Administración docente y el administrador comunitario se modelaron como roles y actores del proceso TO-BE, y no como clases del dominio, porque operan externamente o mediante sincronización sin atributos ni relaciones propias dentro del sistema.
- **Uso de composición y agregación:** Se usó composición entre *Oferta Académica* y *Sección* (una sección no existe fuera de la oferta que la publica y se elimina con ella). No se usó agregación; la relación entre *Simulación de Horario* y *Sección* es una asociación simple, ya que las secciones existen aunque ninguna simulación las incluya.
- **Atributos y datos externos:** Docente, Bloque Horario y Período Académico no se modelaron como clases porque el sistema no almacena información compleja propia sobre ellos, registrándose como simples atributos de texto u horario.
- **Privacidad y anonimato:** La clase *Evaluación* no se asocia con *Estudiante* para garantizar que las valoraciones sean completamente anónimas y no queden vinculadas a ningún identificador personal.
- **Atributos derivados y lógica de negocio:** Datos como la valoración promedio, la dificultad promedio, el tiempo restante para egresar y los créditos totales de la simulación se calculan de forma derivada a partir de otras clases y relaciones del modelo.
