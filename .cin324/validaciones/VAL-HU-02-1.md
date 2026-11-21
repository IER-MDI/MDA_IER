# Informe de validación — HU-02 · Planificador en grilla interactiva

**Fecha:** 2026-11-20 · **Cambio de OpenSpec validado:** `hu-02-planificador-grilla` · **Estado:** verificado en el sistema

## Resumen
| Obs. | Lo que observaste | Tipo | Artefacto principal a modificar | También revisar |
|------|-------------------|------|----------------------------------|------------------|
| OBS-1 | Al agregar una sección debería desaparecer de la oferta y volver solo al removerla | A. Cambio de requisito | `07-criterios-aceptacion.md` (HU-02) y `04-historias-usuario.md` (CA1) | `09-casos-de-uso.md`, `12-trazabilidad.md` |
| OBS-2 | El máximo sin pasarse es 28 créditos y el exceso siempre da 33 de 30 | F. Datos de ejemplo | Ninguno | — |

**Lo que sí funcionó:** los escenarios de agregar (5 + 6 = 11), choque de horario y remoción, con sus mensajes y totales.

## Detalle por observación

### OBS-1 — La sección agregada sigue visible en la oferta
- **Lo que dijiste:** al agregarla debería desaparecer de «Secciones de la oferta académica» y quedar solo en «Secciones en tu horario» hasta removerla.
- **Qué dicen hoy los artefactos:** `04-historias-usuario.md` CA1 solo dice «agregar y remover secciones de la grilla»; `07-criterios-aceptacion.md` (HU-02) no menciona el listado de la oferta. El sistema cumple lo escrito, por lo que no es un defecto de generación.
- **Diagnóstico:** tipo A. La expectativa no está especificada; hay que decidirla y escribirla.
- **Qué debes modificar tú:** en `07`, un escenario que diga que la sección agregada deja de ofrecerse y reaparece al quitarla; en `04`, ampliar CA1 con esa misma regla.
- **Para mantener la consistencia, revisa:**
  - `09-casos-de-uso.md`: CU-06/CU-07 describen agregar/quitar; verificar que no requieran mención al listado de la oferta.
  - `12-trazabilidad.md`: no cambia si no hay requisito nuevo.
  - Spec de OpenSpec: se regenera al ejecutar `/cin324-generar-app`.

### OBS-2 — Solo se llega a 28 y el exceso siempre es 33
- **Lo que dijiste:** la cantidad máxima a la que llegaste fue 28 y al superar el límite siempre ves 33 de 30; asumes que depende de los créditos y de cómo se puede organizar el horario.
- **Qué dicen los datos:** los 8 datos de ejemplo suman 28 créditos sin choques (MAT101 5 + PROG101 6 + BD101 6 + ING101 5 + ECO101 6); la única sección de 5 créditos restante sin choque es HUM101 (sábado), que lleva a 33. El escenario Gherkin usa 28 + 5 con tope 30.
- **Diagnóstico:** tipo F. Limitación de los datos de ejemplo, no de la especificación; la validación del tope funciona correctamente.
- **Qué debes modificar tú:** nada. Si más adelante quieres más variedad (por ejemplo, llegar exacto a 30), sería un ajuste de datos de ejemplo al regenerar, no un cambio de requisitos.

## Orden sugerido de edición
1. `04-historias-usuario.md` (CA1 de HU-02)
2. `07-criterios-aceptacion.md` (escenario de HU-02)
3. `12-trazabilidad.md` (solo verificar que no haga falta cambiar nada)

## Cómo trabajamos los cambios
Elegiste la opción **B**: te propongo cada cambio y tú apruebas, modificas o descartas cada uno. El asistente no toca el código ni `openspec/` y no aplica ningún cambio sin aprobación explícita para ese cambio.

## Cómo sabrás que terminaste
- [ ] Se actualizó el artefacto principal de cada observación de tipo A (por ti o con tu aprobación).
- [ ] Revisamos cada artefacto afectado de la lista.
- [ ] Los diagramas editados (si hubiera) tienen su fuente y su imagen exportada actualizadas.
- [ ] La observación de tipo F quedó resuelta o descartada conscientemente.
- [ ] Revisé la consistencia final (chequeos C1 a C14 y trazabilidad) y todo está ✔.

## Siguiente paso
Cuando todo esté revisado: haz commit de tus artefactos y ejecuta `/cin324-generar-app` para generar el ajuste `ajuste-hu-02-…`. Después, vuelve a ejecutar `/cin324-validar-sistema`.
