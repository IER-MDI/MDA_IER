import fs from "node:fs";
import path from "node:path";
import { crearBase, type BaseDatos } from "../src/db/conexion";
import { sembrar } from "../src/db/seed";

export function baseSembrada(): BaseDatos {
  const db = crearBase(":memory:");
  sembrar(db);
  return db;
}

export function idAsignatura(db: BaseDatos, codigo: string): number {
  const fila = db.prepare("SELECT id FROM asignatura WHERE codigo = ?").get(codigo) as
    | { id: number }
    | undefined;
  if (!fila) {
    throw new Error(`No hay asignatura sembrada con código ${codigo}`);
  }
  return fila.id;
}

export function idSeccion(db: BaseDatos, codigoAsignatura: string): number {
  const fila = db
    .prepare(
      "SELECT s.id FROM seccion s JOIN asignatura a ON a.id = s.asignatura_id WHERE a.codigo = ? AND s.numero = 1"
    )
    .get(codigoAsignatura) as { id: number } | undefined;
  if (!fila) {
    throw new Error(`No hay sección sembrada para ${codigoAsignatura}`);
  }
  return fila.id;
}

export function idEstudianteDemo(db: BaseDatos): number {
  const fila = db.prepare("SELECT id FROM estudiante WHERE rut = ?").get("11.111.111-1") as
    | { id: number }
    | undefined;
  if (!fila) {
    throw new Error("No hay estudiante demo sembrado");
  }
  return fila.id;
}

export function sumaCreditos(db: BaseDatos, codigos: string[]): number {
  const marcas = codigos.map(() => "?").join(",");
  const fila = db
    .prepare(
      "SELECT COALESCE(SUM(a.creditos), 0) AS total FROM seccion s " +
        "JOIN asignatura a ON a.id = s.asignatura_id " +
        `WHERE a.codigo IN (${marcas})`
    )
    .get(...codigos) as { total: number };
  return fila.total;
}

export function idOferta(db: BaseDatos, periodo: string): number {
  const fila = db.prepare("SELECT id FROM oferta_academica WHERE periodo = ?").get(periodo) as
    | { id: number }
    | undefined;
  if (!fila) {
    throw new Error(`No hay oferta con período ${periodo}`);
  }
  return fila.id;
}

export function estadoOferta(db: BaseDatos, id: number): string {
  const fila = db.prepare("SELECT estado FROM oferta_academica WHERE id = ?").get(id) as
    | { estado: string }
    | undefined;
  if (!fila) {
    throw new Error(`No hay oferta con id ${id}`);
  }
  return fila.estado;
}

export function csvEjemplo(): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "datos", "ejemplo-oferta-2026-3.csv"));
}

export function csvCon(cuerpo: string): Buffer {
  const cabecera =
    "periodo,codigo,nombre,numero,docente,bloques,creditos,cupos,semestreSugerido\n";
  return Buffer.from(cabecera + cuerpo + "\n", "utf8");
}
