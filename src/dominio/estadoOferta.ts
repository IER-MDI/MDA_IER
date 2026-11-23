export const ESTADOS_OFERTA = [
  "Inicio",
  "Archivo recibido",
  "Mapeo en revisión",
  "Mapeo confirmado",
  "Con inconsistencias",
  "Estructurada",
  "Publicada",
  "Rechazada",
] as const;

export type EstadoOferta = (typeof ESTADOS_OFERTA)[number];

export type EventoOferta =
  | "solicitarArchivo"
  | "evaluarFormato"
  | "confirmarMapeo"
  | "validarDatos"
  | "corregirMapeo"
  | "confirmarPublicacion";

/**
 * Aplica una transición válida de EST-01. El parámetro `guarda` se usa solo en
 * `evaluarFormato` (true = formato admitido) y `validarDatos` (true = datos
 * válidos). Las transiciones no permitidas lanzan un error con mensaje claro.
 */
export function aplicarTransicion(
  estado: EstadoOferta,
  evento: EventoOferta,
  guarda = true
): EstadoOferta {
  const destino = transicion(estado, evento, guarda);
  if (destino === null) {
    throw new Error(
      `Transición inválida: desde «${estado}» no se permite «${evento}»`
    );
  }
  return destino;
}

function transicion(
  estado: EstadoOferta,
  evento: EventoOferta,
  guarda: boolean
): EstadoOferta | null {
  switch (estado) {
    case "Inicio":
      return evento === "solicitarArchivo" ? "Archivo recibido" : null;
    case "Archivo recibido":
      return evento === "evaluarFormato"
        ? guarda
          ? "Mapeo en revisión"
          : "Rechazada"
        : null;
    case "Mapeo en revisión":
      return evento === "confirmarMapeo" ? "Mapeo confirmado" : null;
    case "Mapeo confirmado":
      return evento === "validarDatos"
        ? guarda
          ? "Estructurada"
          : "Con inconsistencias"
        : null;
    case "Con inconsistencias":
      return evento === "corregirMapeo" ? "Mapeo en revisión" : null;
    case "Estructurada":
      return evento === "confirmarPublicacion" ? "Publicada" : null;
    case "Publicada":
    case "Rechazada":
      return null;
    default:
      return null;
  }
}
