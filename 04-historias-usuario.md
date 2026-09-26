# Historias de usuario

## HU-01: Carga y Traducción de Oferta Académica en Excel
Como **estudiante o administrador comunitario**, quiero **subir la planilla Excel publicada por la universidad y validar el mapeo de sus datos**, para **convertir la oferta académica estática en un formato estructurado consumible por la página**.
- **Actividad TO-BE asociada:** Sincronizar y publicar oferta y referencias en el sistema
- **Criterios de aceptación:**
  - **CA1:** El sistema permite arrastrar o seleccionar un archivo `.xlsx` o `.csv`.
  - **CA2:** El procesador interpreta los bloques de horario, nombres de asignaturas, códigos, secciones y docentes.
  - **CA3:** Se presenta una vista previa de los datos parseados antes de confirmarlos para el simulador.

## HU-02: Planificador en Grilla Interactiva
Como **estudiante**, quiero **simular combinaciones de horarios en una grilla interactiva usando los ramos extraídos del Excel**, para **visualizar de forma clara mi carga académica y evitar choques horarios o sobrecarga de créditos**.
- **Actividad TO-BE asociada:** Simular horario y revisar métricas de dificultad
- **Criterios de aceptación:**
  - **CA1:** El sistema permite agregar y remover secciones de la grilla horaria mediante interacción visual.
  - **CA2:** El contador de créditos totales se actualiza dinámicamente según las secciones seleccionadas.
  - **CA3:** El sistema bloquea o advierte de inmediato si una sección genera un choque de horario o supera el tope crediticio.

## HU-03: Consulta de Referencias Comunitaria y Dificultad Docente
Como **estudiante**, quiero **ver las calificaciones comunitarias de profesores y el nivel de dificultad atribuido a cada materia**, para **tomar decisiones informadas al armar mi horario**.
- **Actividad TO-BE asociada:** Simular horario y revisar métricas de dificultad
- **Criterios de aceptación:**
  - **CA1:** Cada sección despliega una valoración (1 a 5 estrellas) del docente y un indicador de dificultad.
  - **CA2:** Las puntuaciones se calculan a partir de los promedios de las evaluaciones ingresadas anónimamente por los estudiantes.
  - **CA3:** La interfaz no expone en ningún apartado la identidad de los estudiantes que emitieron la opinión.

## HU-04: Malla Interactiva y Cadena Crítica Curricular
Como **estudiante**, quiero **seleccionar una asignatura en la malla interactiva y desplegar toda su cadena de prerrequisitos**, para **comprender el impacto curricular completo de aprobar o reprobar un curso**.
- **Actividad TO-BE asociada:** Consultar malla interactiva y tiempo restante
- **Criterios de aceptación:**
  - **CA1:** Al seleccionar un ramo, la malla resalta gráficamente la red completa de prerrequisitos y ramos dependientes futuros.
  - **CA2:** Se aplica un código de colores para diferenciar materias aprobadas, disponibles y bloqueadas.

## HU-05: Estimación del Tiempo Restante de Titulación
Como **estudiante**, quiero **conocer la cantidad mínima estimada de semestres restantes para terminar mi carrera**, para **planificar estratégicamente mi avance académico**.
- **Actividad TO-BE asociada:** Consultar malla interactiva y tiempo restante
- **Criterios de aceptación:**
  - **CA1:** El sistema analiza los ramos aprobados y calcula la ruta crítica mínima de semestres necesarios para egresar.
  - **CA2:** Si se simula reprobar o postergar un ramo, el indicador refleja el potencial retraso en semestres.
