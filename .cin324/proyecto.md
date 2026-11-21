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
| Casos de uso | `09-casos-uso.md` (CU-01 a CU-15), `diagramas/casos-de-uso.png`, `CU-02..05` | completo (numeración inconsistente) |
| Diagramas de estado | `11-diagramas-estado.md`, `diagramas/est-01.puml`, `.png` (Oferta Académica) | completo (solo EST-01) |
| Diagramas de secuencia | `10-diagramas-secuencia.md`, `diagramas/dss_01.md` (DSS-01, Mermaid) | parcial (DSS-02 solo imagen remota; falta `dss-01.puml`) |
| Requisitos y atributos de calidad | `03-requisitos.md`, `06-atributos-calidad.md`, `12-trazabilidad.md` | completo |

## Supuestos acordados (por elementos faltantes o dudosos)
- 2026-11-20 (confirmado por el estudiante): no hay priorización MoSCoW en los documentos; se adopta el orden por dependencias **HU-01 → HU-02 → HU-03 → HU-04 → HU-05**.
- 2026-11-20 (confirmado por el estudiante): para la numeración de casos de uso se toma como fuente de verdad la tabla de `09-casos-uso.md` (HU-01: CU-01..CU-04; HU-02: CU-05..CU-10; HU-03: CU-11..CU-12; HU-04: CU-13..CU-14; HU-05: CU-14..CU-15), dejando constancia de que `CU-14` está duplicado y se resolverá al validar HU-04/HU-05.
- 2026-11-20 (confirmado por el estudiante): el contenido de DSS-02 (HU-02) no es verificable (solo imagen remota de GitHub); el flujo de interacción se reconstruirá con el estudiante durante la validación de HU-02.
- 2026-11-20 (confirmado por el estudiante): `12-trazabilidad.md` está desactualizado respecto de `09-casos-uso.md`; se prioriza `09-casos-uso.md`.

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
| HU-01 | pendiente | — | — | Dependencia base: carga la oferta académica |
| HU-02 | implementada y validada | hu-02-planificador-grilla + ajuste-hu-02-oferta-seccion-agregada | 2026-11-20 | Datos de ejemplo; simulación activa única; OBS-1 resuelta |
| HU-03 | pendiente | — | — | Depende de HU-01/HU-02 (métricas en el simulador) |
| HU-04 | pendiente | — | — | Depende de datos de malla y avance |
| HU-05 | pendiente | — | — | Depende de HU-04 (malla y prerrequisitos) |

## Validaciones
| Historia | Informe | Estado | Fecha |
|----------|---------|--------|-------|
| HU-02 | `.cin324/validaciones/VAL-HU-02-1.md` | Verificado en el sistema. OBS-1 resuelta (la sección agregada sale de la oferta y vuelve al removerla). OBS-2 tipo F: los 27/28 créditos son límite de los datos de ejemplo. | 2026-11-20 |

## Cambios posteriores
| Cambio | Historia afectada | Motivo | Fecha |
|--------|-------------------|--------|-------|
| `ajuste-hu-02-oferta-seccion-agregada` | HU-02 | OBS-1: la sección agregada sale de la oferta y vuelve al removerla | 2026-11-20 |
