import type { BaseDatos } from "../db/conexion";
import { buscarChoque } from "../dominio/horario";
import {
  calcularCreditos as calcularCreditosDeSimulacion,
  crearSimulacion,
  eliminarSeccionDeSimulacion,
  insertarSeccionEnSimulacion,
  listarSeccionesDeSimulacion,
  obtenerSeccion,
  obtenerSimulacion,
  obtenerSimulacionActiva,
  obtenerTopeCreditos,
} from "../dominio/repositorios";
import type { Seccion, Simulacion } from "../dominio/tipos";

export type ResultadoAgregar =
  | { tipo: "ok"; seccion: Seccion; totalCreditos: number }
  | { tipo: "choque"; seccionEnConflicto: Seccion }
  | { tipo: "tope"; totalCreditos: number; tope: number };

export function obtenerSimulacionActivaDelEstudiante(db: BaseDatos, estudianteId: number): Simulacion {
  const existente = obtenerSimulacionActiva(db, estudianteId);
  return existente ?? crearSimulacion(db, estudianteId);
}

export function calcularCreditos(db: BaseDatos, simulacionId: number): number {
  return calcularCreditosDeSimulacion(db, simulacionId);
}

export function listarSeccionesIncluidas(db: BaseDatos, simulacionId: number): Seccion[] {
  return listarSeccionesDeSimulacion(db, simulacionId);
}

export function agregarSeccion(db: BaseDatos, simulacionId: number, seccionId: number): ResultadoAgregar {
  return db.transaction((): ResultadoAgregar => {
    const simulacion = obtenerSimulacion(db, simulacionId);
    if (!simulacion) {
      throw new Error("La simulación no existe");
    }
    const seccion = obtenerSeccion(db, seccionId);
    if (!seccion) {
      throw new Error("La sección no existe");
    }

    const incluidas = listarSeccionesDeSimulacion(db, simulacionId);
    const choque = buscarChoque(seccion.bloques, incluidas);
    if (choque) {
      return { tipo: "choque", seccionEnConflicto: choque.seccion };
    }

    const totalCreditos = calcularCreditosDeSimulacion(db, simulacionId) + seccion.asignatura.creditos;
    const tope = obtenerTopeCreditos(db, simulacion.estudianteId);
    if (totalCreditos > tope) {
      return { tipo: "tope", totalCreditos, tope };
    }

    insertarSeccionEnSimulacion(db, simulacionId, seccionId);
    return { tipo: "ok", seccion, totalCreditos };
  })();
}

export function removerSeccion(db: BaseDatos, simulacionId: number, seccionId: number): void {
  eliminarSeccionDeSimulacion(db, simulacionId, seccionId);
}
