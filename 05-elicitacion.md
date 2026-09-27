# Elicitación de requisitos

## Técnica 1: Entrevista semiestructurada
- **Participante(s):** Estudiantes representantes de carrera y alumnos de últimos semestres.
- **Fecha y modalidad:** 15 de Septiembre de 2026, modalidad virtual (vía Discord).
- **Evidencia1:** ![Captura de pantalla de la primera reunión en línea](./evidencia/entrevista-sesion1.png)
- **Evidencia2:** ![Captura de pantalla de la segunda reunión en línea](./evidencia/entrevista-sesion2.png)
- **Hallazgos principales:**
  - Se confirmó que la universidad publica semestralmente archivos Excel con formatos heterogéneos y cambios frecuentes en las cabeceras de columnas.
  - Al no contar con apoyo institucional ni API oficial, los estudiantes manifestaron la necesidad de una herramienta independiente donde ellos mismos puedan cargar el Excel del semestre y traducirlo para toda la comunidad.
  - Existe frustración con la plataforma oficial porque la malla solo muestra dependencias directas de 1er grado, impidiendo planificar a mediano plazo.

## Técnica 2: Grupo Focal (Focus Group)
- **Participante(s):** Grupo de 8 estudiantes de diversos niveles académicos (1er a 5to año).
- **Fecha y modalidad:** 22 de Septiembre de 2026, modalidad virtual (vía Discord).
- **Evidencia:** [Fotografía de la sesión de grupo focal](./evidencia/focus-group.jpg)
- **Hallazgos principales:**
  - El 100% de los participantes respaldó la idea de una solución independiente y comunitaria ("hecha por y para estudiantes").
  - La función de cargar el Excel y obtener automáticamente la oferta en una grilla visual fue considerada la innovación más crítica para ahorrar horas de trabajo manual.
  - Se exigió anonimato estricto para calificar a los profesores, destacando que en una plataforma independiente esto genera mayor confianza.

## Acta de acuerdo
En reunión de validación celebrada por el equipo de desarrollo y representantes estudiantiles, se alcanzaron los siguientes acuerdos formales:
1. Definir el alcance del sistema como un proyecto independiente y comunitario sin dependencia funcional ni técnica de las bases de datos de la universidad.
2. Desarrollar un módulo traductor/parser capaz de procesar la planilla Excel oficial y convertirla en una estructura de datos estándar consumible por la web.
3. Priorizar la grilla semanal interactiva con detección automática de topes, la malla de cadena crítica y el sistema de evaluación docente anónimo.
