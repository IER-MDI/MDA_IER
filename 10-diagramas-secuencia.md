# Diagramas de secuencia de sistema
 
## DSS-01 — Carga y validación de oferta académica
- Caso de uso: [CU-01](./09-casos-de-uso.md)
- Historia: [HU-01](./04-historias-usuario.md#hu-01)
- Sistemas externos que participan: Sistema de la Universidad

<img width="1280" height="1187" alt="diagrama" src="https://github.com/user-attachments/assets/e6afbac9-3aa0-4162-a98c-15748e5a867a" />

 
![DSS-01](./diagramas/dss-01.md)
 
Archivo fuente: [`./diagramas/dss-01.puml`](./diagramas/dss-01.puml)
 
Variantes representadas:

- **alt — Formato de archivo:** verifica si el archivo Excel o CSV es admitido. Si no lo es, informa un error.
- **opt — Corrección del mapeo:** permite que el usuario modifique la correspondencia entre las columnas de la planilla y los campos del sistema.
- **loop — Validación de datos:** repite la validación mientras existan inconsistencias que deban corregirse.
- **alt — Confirmación de oferta:** publica los datos cuando son válidos y el usuario confirma; de lo contrario, finaliza sin publicarlos.

 
## DSS-02 — [Nombre del escenario]
[Misma estructura. Mínimo 2 diagramas.]
