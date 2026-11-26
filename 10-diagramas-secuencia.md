[10-diagramas-secuencia.md](https://github.com/user-attachments/files/35443203/10-diagramas-secuencia.md)
# Diagramas de secuencia de sistema
 
 
## DSS-01 — Carga y validación de oferta académica
- Casos de uso: [CU-01](./09-casos-uso.md) … [CU-04](./09-casos-uso.md)
- Historia: [HU-01](./04-historias-usuario.md#hu-01)
- Sistemas externos que participan: Sistema de la Universidad (antecedente; publica la planilla, sin mensajes en el DSS)

<img width="1280" height="1187" alt="diagrama" src="https://github.com/user-attachments/assets/e6afbac9-3aa0-4162-a98c-15748e5a867a" />

 
[Diagrama DSS-01 (fuente Mermaid)](./diagramas/dss_01.md)
 
Variantes representadas:

- **alt — Formato de archivo:** verifica si el archivo Excel o CSV es admitido. Si no lo es, informa un error.
- **opt — Corrección del mapeo:** permite que el usuario modifique la correspondencia entre las columnas de la planilla y los campos del sistema.
- **loop — Validación de datos:** repite la validación mientras existan inconsistencias que deban corregirse.
- **alt — Confirmación de oferta:** publica los datos cuando son válidos y el usuario confirma; de lo contrario, finaliza sin publicarlos.

 
## DSS-02 — Simulación de horario académico (HU-02)
- Caso de uso: [CU-05](./09-casos-uso.md)
- Historia: [HU-02](./04-historias-usuario.md#hu-02)
- Sistemas externos que participan: Ninguno durante la simulación

<img width="604" height="1543" alt="aaaaa" src="https://github.com/user-attachments/assets/d1620fc5-8f01-43e8-8474-1f1fa5e6e4b7" />


- **alt:** conflictos de horario, exceso de créditos y selección válida.
- **opt:** eliminar una sección.
- **loop:** modificar horario repetidamente.


## DSS-03 — Registro y confirmación de asignatura en estado tentativo 
- Casos de uso: [CU-06](./09-casos-uso.md) y [CU-15](./09-casos-uso.md)
- Historias: [HU-05 CA5](./04-historias-usuario.md#hu-05) , [HU-04](./04-historias-usuario.md#hu-04) (marca como tentativa en la malla) y [HU-02 CA4](./04-historias-usuario.md#hu-02) 
- Diagrama de estado relacionado: [EST-02 — Recomendación de Asignatura](./11-diagramas-estado.md#est-02--ciclo-de-vida-de-recomendación-de-asignatura-avance-académico), con transición `tentativo` → `confirmada`
- Sistemas externos que participan: Ninguno

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

[Diagrama DSS-03 (fuente Mermaid y notas)](./diagramas/dss_03.md) · [Imagen PNG](./diagramas/dss_03.png)

## Participantes

| Participante | Rol en el flujo |
|--------------|-----------------|
| Estudiante | Actor principal: consulta el avance, marca la asignatura como tentativa y la confirma desde el planificador. |
| Tiempo restante (HU-05) | Calcula la ruta crítica y muestra las asignaturas posibles que agilizan el avance (CA5). |
| Malla interactiva (HU-04) | Muestra estados, prerrequisitos y dependientes; permite marcar la asignatura como tentativa (CU-15). |
| Planificador (HU-02) | Informa sobre asignaturas tentativas (extensión de CU-07) y permite confirmarlas (CU-06). |
| Almacén de recomendaciones | Persiste la *Recomendación de Asignatura* con `estado`, `fechaPropuesta` y `fechaConfirmacion`, asociada a la simulación activa. |


## Cambios

| Artefacto | Cambio |
|-----------|--------|
| HU-02 | CA4: inscribir una asignatura y dejarla en estado tentativo; verse en el planificador y confirmarse ahí. |
| HU-05 | CA5: mostrar qué asignaturas posibles se pueden tomar para agilizar el avance; nuevos escenarios de navegación. |
| HU-04 / CU-15 | Marcar la asignatura como tentativa desde la malla. |
| CU-06 | Confirmar la asignatura tentativa desde el planificador; extensión «Informar sobre asignaturas en estado tentativa» sobre CU-07. |
| Modelo de dominio | Nueva clase *Recomendación de Asignatura* con `estado` (`tentativo`/`confirmada`), `fechaPropuesta` y `fechaConfirmacion`, asociada a *Simulación de Horario* y a *Asignatura*. |
| Diagrama de estado | Nuevo [EST-02](./11-diagramas-estado.md#est-02--ciclo-de-vida-de-recomendación-de-asignatura-avance-académico) para el ciclo de vida de la recomendación. |


## Variantes representadas en el diagrama

- **alt — Confirmación del estudiante:** si confirma (CU-06), la recomendación pasa a `confirmada` y registra `fechaConfirmacion`; si no, permanece `tentativo` sin incorporarse a la simulación.
- **opt — Sección ofertada:** la incorporación a la grilla solo se intenta si la asignatura tiene sección en la oferta activa, porque una asignatura de la malla puede no tenerla.
- **alt — Validación de carga:** se aplican las reglas de DSS-02; ante un choque o exceso de créditos se informa el motivo y no se agrega la sección, aunque la recomendación quede confirmada.

## Trazabilidad del cambio

| Cambio | Historia / criterio | Caso de uso | Secuencia | Estado | Clase del dominio |
|--------|---------------------|-------------|-----------|--------|-------------------|
| Asignatura en estado tentativo | HU-04 + HU-02 CA4 | CU-15, CU-06, extensión de CU-07 | DSS-03 | EST-02 | Recomendación de Asignatura, Simulación de Horario |
| Recomendación de avance | HU-05 CA5 | CU-17 | DSS-03 | EST-02 | Recomendación de Asignatura, Asignatura |

