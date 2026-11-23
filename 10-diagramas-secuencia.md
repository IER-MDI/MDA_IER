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
