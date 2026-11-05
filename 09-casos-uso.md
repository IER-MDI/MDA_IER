# Casos de uso
## Historia de origen:
HU-01: Carga y Traducción de Oferta Académica en Excel
## Actores
| Actor | Tipo (humano / sistema externo) | Descripción |
|-------|----------------------------------|-------------|
| Estudiante  | Humano | Sube la planilla y confirma datos para el simulador |
|Administrador| Humano | Mismo rol que estudiante|
|Sistema de la Universidad| Sistema externo | Entrega la fuente con la oferta académica|
 
## Diagrama de casos de uso
![Casos de uso](./diagramas/casos-de-uso.png)
 
Archivo fuente: [`./diagramas/casos-de-uso.drawio`](./diagramas/casos-de-uso.drawio)
 
## Casos de uso y su origen
| ID | Caso de uso (objetivo del actor) | Actor principal | Historia de origen |
|----|-----------------------------------|-----------------|---------------------|
| CU-01 | Cargar planilla | Cada actor involucrado | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-02 | Validar datos parseados | Cada actor involucrado | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-03 | Previsualizar datos | Estudiante y administrador | [HU-01](./04-historias-usuario.md#hu-01) |
| CU-04 | Confirmar datos | Estudiante y administrador | [HU-01](./04-historias-usuario.md#hu-01) |
