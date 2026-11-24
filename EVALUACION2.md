# Cambio propuesto 
Se debe agregar una asingatura a la malla en estado "tentativo". Ese estado debe poder verse en el planificador y debe poder confirmarse desde ahí.

## Qué es lo que cambia
### Diagramas:
Se modifica el diagrama de casos de uso 02, en donde se añade la extensión "Informar sobre asignaturas en estado tentativa" a "Agregar sección a la grilla horaria".
Se modifica el modelo de dominio para añadir en "simulación de horario" para añadir el estado en "tentativo" a una posible asignatura a tomar.
Se añade un nuevo diagrama de estado "Recomendación de avance académico" en el que se consideran las recomendaciones para el avance.
### Estado:
Se agrega una recomendación de asignatura con estado "tentativo" en el que el usario confirma si quiere cursar la asignatura.

### Cambios en historias de usuario
Modifica la HU-02: Planificador de Grilla Interactiva y la HU-05: Estimación de tiempo de titulación, de este modo se añade un nuevo caso de uso para cada historia:
(HU-02) CA4: El sistema debe permitir inscribir una asignatura y dejarla en estado tentativo.
(HU-05) CA5:  El sistema debe mostrar que asignaturas posibles se pueden tomar para poder agilizar el avance.
Se crean nuevos escenarios con respecto a la navegación de asignaturas en estado tentativo.

### Casos de usos:
Agregar una asignatura en estado tentativo para la HU-02
Confirmar la asignatura tentativa en la planilla para la HU-02
