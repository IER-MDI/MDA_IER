# Estado del proyecto — generación de la aplicación

## Proyecto
- Nombre: SGAI — Sistema de Gestión Académica e Inscripción Interactiva
- Repositorio de documentación: esta carpeta (`D:\MDA_IER`)
- Última auditoría: 2026-11-20 — resultado: con supuestos

## Mapa de artefactos (rutas detectadas)
| Artefacto | Ruta(s) | Estado |
|-----------|---------|--------|
| BPMN AS-IS | `01-proceso-as-is.md`, `diagramas/as-is.png`, `diagramas/as-is.bpmn` | completo |
| BPMN TO-BE | `02-rediseno-to-be.md`, `diagramas/to-be.png`, `diagramas/to-be.bpmn` | completo (sin IDs ACT-TOBE-xx) |
| Historias de usuario | `04-historias-usuario.md` (HU-01 a HU-05) | completo |
| Criterios Gherkin | `07-criterios-aceptacion.md` (2 escenarios por historia) | completo |
| Modelo de dominio | `08-modelo-dominio.md`, `diagramas/modelo-dominio.puml`, `.png` | completo |
| Casos de uso | `09-casos-uso.md` (CU-01 a CU-16), `diagramas/casos-de-uso.png`, `CU-02..05` | completo |
| Diagramas de estado | `11-diagramas-estado.md`, `diagramas/est-01.puml`, `.png` (Oferta Académica) | completo (solo EST-01) |
| Diagramas de secuencia | `10-diagramas-secuencia.md`, `diagramas/dss_01.md` (DSS-01, Mermaid) | parcial (DSS-02 solo imagen remota; falta `dss-01.puml`) |
| Requisitos y atributos de calidad | `03-requisitos.md`, `06-atributos-calidad.md`, `12-trazabilidad.md` | completo |

## Supuestos acordados (por elementos faltantes o dudosos)
- 2026-11-20 (confirmado por el estudiante): no hay priorización MoSCoW en los documentos; se adopta el orden por dependencias **HU-01 → HU-02 → HU-03 → HU-04 → HU-05**.
- 2026-11-20 (confirmado por el estudiante): para la numeración de casos de uso se toma como fuente de verdad la tabla de `09-casos-uso.md`.
- 2026-11-22 (aprobado por el estudiante): resuelto el duplicado de `CU-14` renumerando: HU-01: CU-01..CU-04; HU-02: CU-05..CU-10; HU-03: CU-11..CU-12; HU-04: CU-13..CU-14; HU-05: CU-15..CU-16. Actualizados `09-casos-uso.md` y `12-trazabilidad.md`.
- 2026-11-20 (confirmado por el estudiante): el contenido de DSS-02 (HU-02) no es verificable (solo imagen remota de GitHub); el flujo de interacción se reconstruirá con el estudiante durante la validación de HU-02.
- 2026-11-20 (confirmado por el estudiante): `12-trazabilidad.md` está desactualizado respecto de `09-casos-uso.md`; se prioriza `09-casos-uso.md`.
- 2026-11-22 (confirmado por el estudiante): «reprobar» y «postergar» tienen el mismo efecto y la simulación no se persiste. Tras integrar HU-04 y HU-05, HU-05 calcula la ruta crítica sobre la malla compartida del `seed` (13 asignaturas y 7 prerrequisitos); HU-01 sigue pendiente, así que la malla y el avance son datos de ejemplo.
- 2026-11-22 (aprobado por el estudiante): HU-01 se construye sobre `origin/main` con HU-04/HU-05 ya integradas, usa la migración `004_estado_oferta.sql` y no modifica la malla, los prerrequisitos, el avance ni el código de HU-04/HU-05. La oferta publicada pasa a ser la oferta activa de HU-02; las asignaturas se reutilizan por código conservando su `id` para no romper HU-03/HU-04/HU-05.

## Stack (se define una sola vez)
- Lenguaje y framework: TypeScript + Express (plantillas EJS)
- Base de datos: SQLite con `better-sqlite3` — archivo `data/app.db`
- Pruebas: Vitest + supertest (una prueba por escenario Gherkin)
- Cómo instalar: `npm install`
- Cómo ejecutar: `npm run dev` — URL: `http://localhost:3000`
- Cómo probar: `npm test` (datos de ejemplo: `npm run db:seed`)

## Historias
| Historia | Estado | Cambio de OpenSpec | Fecha | Observaciones |
|----------|--------|--------------------|-------|----------------|
| HU-01 | implementada y validada | hu-01-carga-oferta-academica (archivado como 2026-11-23-hu-01-carga-oferta-academica) | 2026-11-23 | Carga CSV/XLSX, EST-01, oferta activa e integración con HU-02…HU-05; migración `004`; no toca malla, prerrequisitos ni avance; 59 pruebas en verde |
| HU-02 | implementada y validada | hu-02-planificador-grilla + ajuste-hu-02-oferta-seccion-agregada | 2026-11-20 | Datos de ejemplo; simulación activa única; OBS-1 resuelta |
| HU-03 | implementada y validada | hu-03-metricas-dificultad | 2026-11-21 | CU-11/CU-12; métricas por asignatura + docente; solo MAT101 con evaluaciones de ejemplo |
| HU-04 | implementada y validada | hu-04-malla-cadena (archivado como 2026-11-22-hu-04-malla-cadena) | 2026-11-22 | CU-13/CU-14; estados, cadena transitiva y etiqueta «En curso»; seed unificado con HU-05 en el merge |
| HU-05 | implementada y archivada | hu-05-tiempo-restante (archivado como 2026-11-23-hu-05-tiempo-restante) | 2026-11-23 | CU-15/CU-16; ruta crítica sobre la malla compartida; simulación no persistida; spec `tiempo-restante` integrada en `openspec/specs/` |

## Validaciones
| Historia | Informe | Estado | Fecha |
|----------|---------|--------|-------|
| HU-01 | — (sin observaciones) | Verificado en el sistema y con `npm test` (59 pruebas en verde): carga, corrección de mapeo, exclusión, publicación e integración. | 2026-11-23 | Sin cambios en malla, prerrequisitos ni avance. |
| HU-02 | `.cin324/validaciones/VAL-HU-02-1.md` | Verificado en el sistema. OBS-1 resuelta (la sección agregada sale de la oferta y vuelve al removerla). OBS-2 tipo F: los 27/28 créditos son límite de los datos de ejemplo. | 2026-11-20 |
| HU-03 | — (sin observaciones) | Verificado en el sistema: valoraciones visibles en el planificador y «Sin evaluaciones» donde corresponde. | 2026-11-21 |
| HU-04 | — (sin observaciones) | Verificado por el estudiante: malla con estados, cadena transitiva y etiqueta «En curso»; sin observaciones pendientes. | 2026-11-22 |
| HU-05 | `.cin324/validaciones/VAL-HU-05-1.md` | Pendiente de resolver las observaciones registradas; el mínimo de 4 semestres y el retraso al reprobar MAT202 quedan verificados en `tests/hu-05.test.ts`. | 2026-11-22 |

## Cambios posteriores
| Cambio | Historia afectada | Motivo | Fecha |
|--------|-------------------|--------|-------|
| `ajuste-hu-02-oferta-seccion-agregada` | HU-02 | OBS-1: la sección agregada sale de la oferta y vuelve al removerla | 2026-11-20 |
| `merge-hu-04-hu-05` | HU-04, HU-05 | Integración de las dos ramas: un esquema y un `seed` compartidos (13 asignaturas, 7 prerrequisitos y 5 registros de avance) | 2026-11-22 |
