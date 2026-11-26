# DSS-03 — Registro y confirmación de asignatura en estado tentativo

Cambio de Evaluación 2 (`EVALUACION2.md`): el sistema sugiere asignaturas para agilizar el avance (HU-05), el estudiante marca una como **tentativa** desde la malla (HU-04/CU-15), la ve en el planificador y la **confirma** desde ahí (HU-02/CU-06). La recomendación se modela como *Recomendación de Asignatura* con estado `tentativo` → `confirmada`, asociada a la *Simulación de Horario* activa (`08-modelo-dominio.md`). Su ciclo de vida se detalla en [EST-02](./est-02.puml).

```mermaid
sequenceDiagram
    autonumber
    actor U as Estudiante
    participant TR as Tiempo restante (HU-05)
    participant MA as Malla interactiva (HU-04)
    participant PL as Planificador (HU-02)
    participant BD as Almacén de recomendaciones

    U->>TR: Consultar tiempo restante para titularse (CU-17)
    TR->>TR: Calcular ruta crítica, prioridades y asignaturas cursables
    TR-->>U: Mostrar mínimo de semestres y asignaturas posibles (HU-05 CA5)

    U->>MA: Navegar a la malla y seleccionar una asignatura cursable (CU-14/CU-16)
    MA->>MA: Mostrar estado, prerrequisitos y dependientes
    MA-->>U: Asignatura disponible, sin registro de avance

    U->>MA: Marcar la asignatura como tentativa (CU-15)
    MA->>BD: Crear Recomendación de Asignatura (estado=tentativo, fechaPropuesta)
    BD-->>MA: Recomendación registrada
    MA-->>U: Asignatura visible como "tentativa" en la malla

    U->>PL: Abrir el planificador (CU-05)
    PL->>BD: Consultar recomendaciones tentativas de la simulación activa
    BD-->>PL: Lista de recomendaciones tentativas
    PL-->>U: Informar sobre asignaturas en estado tentativa (extensión de CU-07) y mostrar opción "Confirmar" (HU-02 CA4)

    alt El estudiante confirma la asignatura (CU-06)
        U->>PL: Confirmar asignatura tentativa
        PL->>BD: Registrar confirmación (estado=confirmada, fechaConfirmacion)
        opt La asignatura tiene sección ofertada en la oferta activa
            PL->>PL: Validar choque de horario y tope de créditos (CU-10/CU-11, ver DSS-02)
            alt Sin conflictos
                PL->>BD: Incorporar la sección a la simulación y actualizar créditos
                PL-->>U: Mostrar la asignatura en la grilla y el nuevo total
            else Conflicto o exceso de créditos
                PL-->>U: Advertir el motivo, la recomendación queda confirmada pero no se incorpora la sección
            end
        end
    else El estudiante no confirma
        U->>PL: Cerrar o diferir la recomendación
        PL-->>U: La asignatura permanece en estado tentativo sin incorporarse a la simulación
    end
```

Imagen generada: [dss_03.png](./dss_03.png)

## Participantes

| Participante | Rol en el flujo |
|--------------|-----------------|
| Estudiante | Actor principal: consulta el avance, marca la asignatura como tentativa y la confirma desde el planificador. |
| Tiempo restante (HU-05) | Calcula la ruta crítica y muestra las asignaturas posibles que agilizan el avance (CA5). |
| Malla interactiva (HU-04) | Muestra estados, prerrequisitos y dependientes; permite marcar la asignatura como tentativa (CU-15). |
| Planificador (HU-02) | Informa sobre asignaturas tentativas (extensión de CU-07) y permite confirmarlas (CU-06). |
| Almacén de recomendaciones | Persiste la *Recomendación de Asignatura* con `estado`, `fechaPropuesta` y `fechaConfirmacion`, asociada a la simulación activa. |

## Variantes representadas

- **alt — Confirmación del estudiante:** si confirma, la recomendación pasa a `confirmada` y registra `fechaConfirmacion`; si no, permanece `tentativo` sin incorporarse a la simulación.
- **opt — Sección ofertada:** la incorporación a la grilla solo se intenta si la asignatura tiene sección en la oferta activa (una asignatura de la malla puede no tenerla).
- **alt — Validación de carga:** se reutilizan las reglas de choque de horario y tope de créditos de DSS-02 (CU-10/CU-11); ante un conflicto se informa el motivo y no se agrega la sección.
