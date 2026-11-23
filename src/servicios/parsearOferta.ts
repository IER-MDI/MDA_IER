import { DIAS } from "../dominio/tipos";
import type { FilaPlanilla, PlanillaLeida } from "./leerPlanilla";

export const CAMPOS = [
  "periodo",
  "codigo",
  "nombre",
  "numero",
  "docente",
  "bloques",
  "creditos",
  "cupos",
  "semestreSugerido",
] as const;

export type Campo = (typeof CAMPOS)[number];
export type Mapeo = Record<Campo, string>;

export interface BloqueParseado {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface SeccionParseada {
  numeroFila: number;
  codigo: string;
  nombre: string;
  numero: number;
  docente: string;
  bloques: BloqueParseado[];
  creditos: number;
  cupos: number;
  semestreSugerido: number;
}

export interface FilaInvalida {
  numeroFila: number;
  motivo: string;
}

export interface ResultadoParseo {
  periodo: string;
  filas: SeccionParseada[];
  errores: FilaInvalida[];
  encabezados: string[];
  mapeo: Mapeo;
}

const ALIASES: Record<Campo, string[]> = {
  periodo: ["periodo"],
  codigo: ["codigo", "code"],
  nombre: ["nombre", "asignatura"],
  numero: ["numero", "seccion", "numerodeseccion", "seccionnumero"],
  docente: ["docente", "profesor"],
  bloques: ["bloques", "bloque", "horario", "modulohorario", "modulo"],
  creditos: ["creditos"],
  cupos: ["cupos", "cupo"],
  semestreSugerido: ["semestresugerido", "semestre"],
};

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .trim();
}

export function mapeoPorDefecto(encabezados: string[]): Mapeo {
  const mapeo = {} as Mapeo;
  for (const campo of CAMPOS) {
    const alias = ALIASES[campo];
    mapeo[campo] = encabezados.find((encabezado) => alias.includes(normalizar(encabezado))) ?? "";
  }
  return mapeo;
}

export function parsearOferta(planilla: PlanillaLeida, mapeo: Mapeo): ResultadoParseo {
  const periodo = encontrarPeriodo(planilla.filas, mapeo.periodo);
  const filas: SeccionParseada[] = [];
  const errores: FilaInvalida[] = [];
  const vistas = new Set<string>();

  for (const fila of planilla.filas) {
    const codigo = valor(fila, mapeo.codigo);
    if (!codigo) {
      errores.push({ numeroFila: fila.numero, motivo: "sin código" });
      continue;
    }

    const bloques = parsearBloques(valor(fila, mapeo.bloques));
    if (bloques.length === 0) {
      errores.push({ numeroFila: fila.numero, motivo: "sin bloques horarios" });
      continue;
    }

    const numero = numeroSeccion(valor(fila, mapeo.numero));
    const clave = `${codigo}|${numero}`;
    if (vistas.has(clave)) {
      errores.push({ numeroFila: fila.numero, motivo: "sección duplicada" });
      continue;
    }

    const creditos = Number(valor(fila, mapeo.creditos));
    const cupos = Number(valor(fila, mapeo.cupos));
    const semestreSugerido = Number(valor(fila, mapeo.semestreSugerido));
    if (
      !Number.isInteger(creditos) ||
      creditos <= 0 ||
      !Number.isInteger(cupos) ||
      cupos < 0 ||
      !Number.isInteger(semestreSugerido) ||
      semestreSugerido < 1
    ) {
      errores.push({
        numeroFila: fila.numero,
        motivo: "crédito/cupo/semestre inválido",
      });
      continue;
    }

    vistas.add(clave);
    filas.push({
      numeroFila: fila.numero,
      codigo,
      nombre: valor(fila, mapeo.nombre),
      numero,
      docente: valor(fila, mapeo.docente).replace(/\s+/g, " "),
      bloques,
      creditos,
      cupos,
      semestreSugerido,
    });
  }

  return { periodo, filas, errores, encabezados: planilla.encabezados, mapeo };
}

function valor(fila: FilaPlanilla, encabezado: string): string {
  if (!encabezado) {
    return "";
  }
  return (fila.celdas[encabezado] ?? "").trim();
}

function encontrarPeriodo(filas: FilaPlanilla[], encabezado: string): string {
  for (const fila of filas) {
    const periodo = valor(fila, encabezado);
    if (periodo) {
      return periodo;
    }
  }
  return "";
}

function numeroSeccion(texto: string): number {
  const numero = Number(texto);
  return Number.isInteger(numero) && numero > 0 ? numero : 1;
}

function parsearBloques(texto: string): BloqueParseado[] {
  if (!texto) {
    return [];
  }
  const bloques: BloqueParseado[] = [];
  for (const parte of texto.split(";")) {
    const bloque = parsearBloque(parte);
    if (bloque) {
      bloques.push(bloque);
    }
  }
  return bloques;
}

function parsearBloque(texto: string): BloqueParseado | null {
  const coincidencia =
    /^([a-záéíóúñ]+)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/i.exec(texto.trim());
  if (!coincidencia) {
    return null;
  }
  const dia = normalizar(coincidencia[1]!);
  const horaInicio = coincidencia[2]!;
  const horaFin = coincidencia[3]!;
  if (!DIAS.some((valido) => valido === dia) || !horaValida(horaInicio) || !horaValida(horaFin) || horaInicio >= horaFin) {
    return null;
  }
  return { dia, horaInicio, horaFin };
}

function horaValida(hora: string): boolean {
  const partes = hora.split(":").map(Number);
  const horas = partes[0] ?? -1;
  const minutos = partes[1] ?? -1;
  return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
}
