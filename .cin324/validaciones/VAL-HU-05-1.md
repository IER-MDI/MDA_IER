# Informe de validación — HU-05 · Estimación del tiempo restante de titulación

**Fecha:** 2026-11-22 · **Cambio de OpenSpec validado:** `hu-05-tiempo-restante` · **Estado:** artefactos actualizados

## Resumen

| Obs. | Lo que observaste | Tipo | Artefacto principal a modificar | También revisar |
|------|-------------------|------|----------------------------------|------------------|
| OBS-1 | Falta un texto que indique qué asignaturas pendientes se pueden cursar, sin las bloqueadas por falta de requisitos | B (brecha; puede ser E si se difiere a HU-04) | `07-criterios-aceptacion.md`, HU-05 | `04-historias-usuario.md`, `08-modelo-dominio.md`, `.cin324/historias/HU-05.md`, `12-trazabilidad.md` |
| OBS-2 | «Semestre sugerido» debería mostrar el semestre al que pertenece la asignatura | B | `08-modelo-dominio.md` (si es dato nuevo) o `07-criterios-aceptacion.md`/`04-historias-usuario.md` (si es solo rótulo) | `diagramas/modelo-dominio.puml`, `07-criterios-aceptacion.md`, `12-trazabilidad.md` |
| OBS-3 | «Ruta crítica» debería llamarse «Prioridad» con tres valores: postergable, necesaria y crítica | A (cambio de requisito) | `04-historias-usuario.md`, HU-05 CA1/CA2 | `07-criterios-aceptacion.md`, `03-requisitos.md` (RP-04), `08-modelo-dominio.md`, `09-casos-uso.md`, `10-diagramas-secuencia.md`, `12-trazabilidad.md` |

**Lo que sí funcionó:** el mínimo de 4 semestres y el paso a 5 con retraso 1 al reprobar MAT202 quedaron verificados en `tests/hu-05.test.ts`.

## Detalle por observación

### OBS-1 — Cursables vs. bloqueadas
- **Lo que dijiste:** en el apartado de asignaturas pendientes debería mostrarse un texto que represente a las asignaturas que se puedan cursar —las que el estudiante puede tomar si se ofrecen ese semestre— sin mostrar las restringidas por falta de requisitos.
- **Qué dicen hoy los artefactos:** el flujo de `.cin324/historias/HU-05.md` (paso 5) y el Gherkin de `07-criterios-aceptacion.md:120-134` solo piden la lista de pendientes marcando las críticas. No definen cursabilidad. El par «disponible / bloqueada» aparece en HU-04 (`04-historias-usuario.md:32` y `07-criterios-aceptacion.md:105`).
- **Diagnóstico:** tipo B (brecha en HU-05) o tipo E si se decide que ese control pertenece a HU-04 y se difiere a esa historia.
- **Qué debes modificar tú:** decidir si la cursabilidad entra en HU-05 y si las bloqueadas se ocultan del todo o se muestran marcadas como bloqueadas.
- **Para mantener la consistencia, revisa:**
  - `04-historias-usuario.md`: nuevo criterio de aceptación en HU-05, si aplica.
  - `07-criterios-aceptacion.md`: escenario con el texto «Cursables» y su regla.
  - `08-modelo-dominio.md`: confirmar que la regla se deriva de «es prerrequisito de» y del avance aprobado.
  - `12-trazabilidad.md`: fila de RP-04 / HU-05.

### OBS-2 — Semestre de la asignatura
- **Lo que dijiste:** la columna «Semestre sugerido» debería mostrar el semestre al que pertenece la asignatura.
- **Qué dicen hoy los artefactos:** `08-modelo-dominio.md:15` define el atributo `semestreSugerido` en Asignatura; la ficha de HU-05 lo usa como atributo leído. No existe un atributo «semestre al que pertenece».
- **Diagnóstico:** tipo B (brecha/ambigüedad de vocabulario). Si solo cambia la etiqueta, el dato ya existe; si es un dato distinto, hay que ampliar el modelo.
- **Qué debes modificar tú:** decidir entre renombrar la columna conservando `semestreSugerido` o agregar el atributo nuevo al modelo.
- **Para mantener la consistencia, revisa:**
  - `diagramas/modelo-dominio.puml` y `08-modelo-dominio.md`: si se agrega el atributo, actualizar fuente y tabla (la imagen `.png` se exporta aparte).
  - `07-criterios-aceptacion.md`: usar el mismo nombre en los Entonces.
  - `12-trazabilidad.md`: consecuencia de lo anterior.

### OBS-3 — Prioridad en tres niveles
- **Lo que dijiste:** «Ruta crítica» debería decir «Prioridad» y mostrar postergable, necesaria y crítica. Postergable = no afecta el tiempo de titulación; necesaria = afecta el avance a partir del próximo semestre; crítica = retrasa la titulación en uno o más semestres.
- **Qué dicen hoy los artefactos:** la ficha de HU-05 (flujo paso 5) y el requirement 2 del spec de `tiempo-restante` clasifican solo «crítica» vs. «no crítica», según pertenencia a la cadena más larga.
- **Diagnóstico:** tipo A (cambio de requisito): se introduce una regla de negocio nueva con tres valores.
- **Qué debes modificar tú:** confirmar la definición de «necesaria» (se propone: prerrequisito de otra pendiente, sin pertenecer a la cadena más larga) y si se ajustan los datos de ejemplo para que aparezca ese nivel.
- **Para mantener la consistencia, revisa:**
  - `03-requisitos.md`: RP-04 debe mencionar la priorización.
  - `07-criterios-aceptacion.md`: escenario con los tres valores.
  - `08-modelo-dominio.md`: `prioridad` es un atributo derivado; no requiere clase nueva.
  - `09-casos-uso.md` y `10-diagramas-secuencia.md`: vocabulario de CU-14/CU-15 (no hay DSS documentado para HU-05).
  - `12-trazabilidad.md`: al final.

## Orden sugerido de edición

1. `03-requisitos.md` (RP-04) — OBS-3.
2. `04-historias-usuario.md` (HU-05) — OBS-1 y OBS-3.
3. `07-criterios-aceptacion.md` (HU-05) — OBS-1, OBS-2 y OBS-3.
4. `08-modelo-dominio.md` y `diagramas/modelo-dominio.puml` — OBS-1 y OBS-2.
5. `09-casos-uso.md` — OBS-3.
6. `10-diagramas-secuencia.md` — OBS-3 (reconstrucción, si aplica).
7. `12-trazabilidad.md` — consecuencia de todo lo anterior.

## Cómo trabajamos los cambios

Elige: **A)** los editas tú; **B)** te propongo cada cambio y tú apruebas, modificas o descartas cada uno; **C)** mixto. Yo no toco el código y no aplico ningún cambio sin tu aprobación explícita.

## Cómo sabrás que terminaste

- [x] Se actualizó el artefacto principal de OBS-1, OBS-2 y OBS-3.
- [x] Revisamos cada artefacto afectado de la lista.
- [x] Los diagramas editados tienen su fuente y su imagen exportada actualizadas.
- [x] Las observaciones de tipo E o F quedaron resueltas o descartadas conscientemente.
- [x] Revisé la consistencia final (C1 a C14 y trazabilidad) y todo está ✔.

## Siguiente paso

Cuando todo esté revisado: haz commit de tus artefactos y ejecuta `/cin324-generar-app` para generar el ajuste. Después, vuelve a ejecutar `/cin324-validar-sistema`.
