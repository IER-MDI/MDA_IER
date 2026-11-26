## Después de los cambios (Evaluación 2)

### Modelo de dominio actualizado

Este diagrama representa los cambios del requisito de asignaturas tentativas, visibles y confirmables desde el planificador.

![Modelo de dominio actualizado - Evaluación 2](./diagramas/modelo-dominio-eval2.png)

**Archivo fuente editable:** [modelo-dominio-eval2.puml](./diagramas/modelo-dominio-eval2.puml)

### Nuevos elementos

| Clase | Atributos | Descripción |
|---|---|---|
| Recomendación de Asignatura | `id`, `estado`, `fechaPropuesta`, `fechaConfirmacion` | Representa una asignatura recomendada o agregada a la planificación con estado `tentativo` o `confirmada`. |

### Nuevas asociaciones

| Clases relacionadas | Multiplicidades | Justificación |
|---|---|---|
| Simulación de Horario — Recomendación de Asignatura | 1 a 0..* | Una simulación contiene cero o más recomendaciones; cada recomendación pertenece a una simulación. |
| Recomendación de Asignatura — Asignatura | 0..* a 1 | Cada recomendación corresponde a una asignatura; una asignatura puede figurar en distintas recomendaciones. |

### Justificación de la modificación

La nueva entidad permite registrar una asignatura en estado `tentativo`, visualizarla desde el planificador y cambiarla a `confirmada`. La confirmación corresponde a la planificación personal y **no equivale a aprobar ni inscribir oficialmente la asignatura**. La propuesta se vincula con HU-02 y HU-05 según la documentación de la Evaluación 2.

**Nota de consistencia:** conservar el diagrama original como evidencia del antes y comprobar que el `.puml`, la imagen, las pruebas y el código final coincidan. El modelo propuesto normaliza dos multiplicidades que diferían entre la descripción y el PlantUML original; registrar esa corrección por separado en `eval2/CAMBIOS.md`.
