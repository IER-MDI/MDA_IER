import type { Bloque, Seccion } from "./tipos";
import { ETIQUETAS_DIA } from "./tipos";

export function seSolapan(a: Bloque, b: Bloque): boolean {
  return a.dia === b.dia && a.horaInicio < b.horaFin && b.horaInicio < a.horaFin;
}

export interface Choque {
  bloqueNuevo: Bloque;
  bloqueExistente: Bloque;
  seccion: Seccion;
}

export function buscarChoque(bloquesNuevos: Bloque[], incluidas: Seccion[]): Choque | null {
  for (const seccion of incluidas) {
    for (const bloqueExistente of seccion.bloques) {
      for (const bloqueNuevo of bloquesNuevos) {
        if (seSolapan(bloqueNuevo, bloqueExistente)) {
          return { bloqueNuevo, bloqueExistente, seccion };
        }
      }
    }
  }
  return null;
}

export function formatoBloque(bloque: Bloque): string {
  return `${bloque.dia} ${bloque.horaInicio}–${bloque.horaFin}`;
}

export function textoHorario(bloques: Bloque[]): string {
  return bloques
    .map((bloque) => `${ETIQUETAS_DIA[bloque.dia] ?? bloque.dia} ${bloque.horaInicio}–${bloque.horaFin}`)
    .join(" · ");
}
