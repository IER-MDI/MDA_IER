sequenceDiagram
    autonumber
    actor U as Estudiante / Administrador
    participant S as Sistema SGAI

    U->>S: Cargar archivo Excel o CSV

    alt Formato no admitido
        S-->>U: Mostrar error de formato
    else Formato admitido
        S->>S: Leer e interpretar la planilla
        S->>S: Extraer asignaturas, códigos, secciones, horarios y docentes
        S->>S: Validar estructura y datos
        S-->>U: Mostrar vista previa y mapeo

        opt Usuario necesita corregir el mapeo
            loop Mientras existan inconsistencias
                U->>S: Corregir columnas o datos
                S->>S: Reprocesar y validar
                alt Persisten errores
                    S-->>U: Mostrar inconsistencias
                else Datos válidos
                    S-->>U: Actualizar vista previa
                end
            end
        end

        alt Datos válidos y usuario confirma
            U->>S: Confirmar oferta académica
            S->>S: Estructurar y guardar datos
            S-->>U: Oferta disponible en simulador
        else Usuario cancela o quedan errores
            S-->>U: No publicar la oferta
        end
    end
