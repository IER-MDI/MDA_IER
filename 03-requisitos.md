# Clasificación de requisitos
 
## Requisitos de producto
| ID | Requisito | Tipo (funcional/no funcional) | Actividad TO-BE asociada |
|----|-----------|--------------------------------|----------------------------|
| RP-01 | El sistema debe permitir la carga de archivos de oferta académica en formato Excel (.xlsx/.csv) y traducir su estructura heterogénea a una estructura de datos JSON utilizable por la plataforma. | Funcional | Sincronizar y publicar oferta y referencias en el sistema |
| RP-02 | El sistema debe contar con un módulo de validación y mapeo de columnas para asociar campos del Excel (código, asignatura, sección, docente, módulo horario) con el esquema interno del sistema. | Funcional | Sincronizar y publicar oferta y referencias en el sistema |
| RP-03 | El sistema debe desplegar un grafo dinámico de la malla curricular que resalte la cadena crítica completa de prerrequisitos y correquisitos de una asignatura seleccionada. | Funcional | Consultar malla interactiva y tiempo restante |
| RP-04 | El sistema debe calcular y mostrar el estimado en semestres para terminar la carrera según la ruta crítica de asignaturas pendientes. | Funcional | Consultar malla interactiva y tiempo restante |
| RP-05 | El sistema debe proporcionar una grilla interactiva semanal que permita al estudiante simular horarios agregando o eliminando secciones extraídas del Excel traducido. | Funcional | Simular horario y revisar métricas de dificultad |
| RP-06 | El sistema debe desplegar la calificación comunitaria de dificultad de las materias y la puntuación de los docentes asignados dentro del planificador. | Funcional | Simular horario y revisar métricas de dificultad |
| RP-07 | El sistema debe validar automáticamente en tiempo real que las secciones seleccionadas no generen choques horarios ni excedan la carga máxima de créditos permitida. | Funcional | Validar automáticamente topes y créditos en simulador |
| RP-08 | El sistema debe permitir guardar localmente o exportar la simulación del horario validado para el uso del estudiante en su inscripción final. | Funcional | Confirmar e inscribir horario simulado |
| RP-09 | El procesador de Excel debe tolerar variaciones en la estructura de la planilla y parsear la oferta académica completa en un tiempo inferior a 3 segundos. | No funcional | Sincronizar y publicar oferta y referencias en el sistema |
| RP-10 | La interfaz del simulador interactivo debe responder a las interacciones del usuario (agregar/quitar ramos) en un tiempo inferior a 500 milisegundos. | No funcional | Simular horario y revisar métricas de dificultad |
| RP-11 | Las valoraciones y comentarios sobre profesores y asignaturas deben almacenarse y desplegarse bajo estricto anonimato del estudiante. | No funcional | Simular horario y revisar métricas de dificultad |
| RP-12 | El sistema debe implementar filtros automáticos y mecanismos de reporte para moderar comentarios ofensivos o inadecuados. | No funcional | Simular horario y revisar métricas de dificultad |
 
## Requisitos de proyecto
| ID | Requisito |
|----|-----------|
| RY-01 | El proyecto debe alojarse en un repositorio de la organización oficial del equipo en GitHub, incluyendo la documentación estructurada en archivos Markdown (.md). |
| RY-02 | Los diagramas de procesos de negocio (AS-IS y TO-BE) deben modelarse bajo el estándar BPMN 2.0 y adjuntarse tanto en formato PNG como en archivo fuente .bpmn. |
| RY-03 | La Entrega 1 debe ser enviada y consolidada en GitHub antes de la fecha y hora límite establecida. |
 
## Requisito derivado**Requisito origen:** RP-06 (Despliegue de puntuaciones de dificultad y valoraciones de docentes comunitarias)  
**Requisito derivado:** RP-11 (Anonimización estricta de las evaluaciones y valoraciones estudiantiles)  
**Justificación:** Al tratarse de una plataforma independiente impulsada por la comunidad estudiantil, se requiere garantizar la libertad de evaluación sin temor a represalias académicas, derivando la necesidad técnica de desvincular cualquier identificador personal de los registros de puntuación.
**Requisito derivado:** RP-12 (Moderación y filtrado de valoraciones y comentarios)
**Justificación:** Dado que la plataforma garantiza el anonimato estricto de las evaluaciones (RP-11)[cite: 1], se genera la necesidad técnica de implementar un control de contenido y filtrado automático de lenguaje ofensivo o spam, previniendo el uso indebido del anonimato y asegurando que las retroalimentaciones se mantengan en un ámbito académico y respetuoso.
