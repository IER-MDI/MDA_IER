import type { BaseDatos } from "../db/conexion";
import { redondearUnDecimal } from "./metricas";
import type { Bloque, MetricasSeccion, Seccion, Simulacion } from "./tipos";

interface FilaSeccion {
  id: number;
  numero: number;
  docente: string;
  cupos: number;
  asignatura_id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre_sugerido: number;
}

interface FilaBloque {
  id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface FilaSimulacion {
  id: number;
  estudiante_id: number;
  nombre: string;
  estado: string;
}

interface FilaMetricas {
  total: number;
  valoracion: number | null;
  dificultad: number | null;
}

const SELECT_SECCION =
  "SELECT s.id, s.numero, s.docente, s.cupos, a.id AS asignatura_id, a.codigo, a.nombre, " +
  "a.creditos, a.semestre_sugerido " +
  "FROM seccion s " +
  "JOIN asignatura a ON a.id = s.asignatura_id ";

function armarSeccion(db: BaseDatos, fila: FilaSeccion): Seccion {
  return {
    id: fila.id,
    numero: fila.numero,
    docente: fila.docente,
    cupos: fila.cupos,
    asignatura: {
      id: fila.asignatura_id,
      codigo: fila.codigo,
      nombre: fila.nombre,
      creditos: fila.creditos,
      semestreSugerido: fila.semestre_sugerido,
    },
    bloques: listarBloques(db, fila.id),
  };
}

export function listarBloques(db: BaseDatos, seccionId: number): Bloque[] {
  const filas = db
    .prepare("SELECT id, dia, hora_inicio, hora_fin FROM bloque_horario WHERE seccion_id = ? ORDER BY dia, hora_inicio")
    .all(seccionId) as FilaBloque[];
  return filas.map((fila) => ({
    id: fila.id,
    dia: fila.dia,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
  }));
}

export function listarSecciones(db: BaseDatos): Seccion[] {
  const filas = db
    .prepare(
      SELECT_SECCION +
        "JOIN oferta_academica o ON o.id = s.oferta_id " +
        "ORDER BY a.codigo, s.numero"
    )
    .all() as FilaSeccion[];
  return filas.map((fila) => armarSeccion(db, fila));
}

export function listarSeccionesDisponibles(db: BaseDatos, simulacionId: number): Seccion[] {
  const filas = db
    .prepare(
      SELECT_SECCION +
        "JOIN oferta_academica o ON o.id = s.oferta_id " +
        "WHERE s.id NOT IN (SELECT seccion_id FROM simulacion_seccion WHERE simulacion_id = ?) " +
        "ORDER BY a.codigo, s.numero"
    )
    .all(simulacionId) as FilaSeccion[];
  return filas.map((fila) => armarSeccion(db, fila));
}

export function obtenerSeccion(db: BaseDatos, seccionId: number): Seccion | null {
  const fila = db.prepare(SELECT_SECCION + "WHERE s.id = ?").get(seccionId) as FilaSeccion | undefined;
  return fila ? armarSeccion(db, fila) : null;
}

export function obtenerSimulacionActiva(db: BaseDatos, estudianteId: number): Simulacion | null {
  const fila = db
    .prepare(
      "SELECT id, estudiante_id, nombre, estado FROM simulacion WHERE estudiante_id = ? " +
        "ORDER BY id LIMIT 1"
    )
    .get(estudianteId) as FilaSimulacion | undefined;
  return fila
    ? { id: fila.id, estudianteId: fila.estudiante_id, nombre: fila.nombre, estado: fila.estado }
    : null;
}

export function obtenerSimulacion(db: BaseDatos, simulacionId: number): Simulacion | null {
  const fila = db
    .prepare("SELECT id, estudiante_id, nombre, estado FROM simulacion WHERE id = ?")
    .get(simulacionId) as FilaSimulacion | undefined;
  return fila
    ? { id: fila.id, estudianteId: fila.estudiante_id, nombre: fila.nombre, estado: fila.estado }
    : null;
}

export function crearSimulacion(db: BaseDatos, estudianteId: number, nombre = "Mi horario"): Simulacion {
  const resultado = db
    .prepare("INSERT INTO simulacion (estudiante_id, nombre, estado) VALUES (?, ?, 'en armado')")
    .run(estudianteId, nombre);
  return {
    id: Number(resultado.lastInsertRowid),
    estudianteId,
    nombre,
    estado: "en armado",
  };
}

export function listarSeccionesDeSimulacion(db: BaseDatos, simulacionId: number): Seccion[] {
  const filas = db
    .prepare(
      SELECT_SECCION +
        "JOIN simulacion_seccion ss ON ss.seccion_id = s.id " +
        "WHERE ss.simulacion_id = ? ORDER BY a.codigo, s.numero"
    )
    .all(simulacionId) as FilaSeccion[];
  return filas.map((fila) => armarSeccion(db, fila));
}

export function insertarSeccionEnSimulacion(db: BaseDatos, simulacionId: number, seccionId: number): void {
  db.prepare("INSERT OR IGNORE INTO simulacion_seccion (simulacion_id, seccion_id) VALUES (?, ?)").run(
    simulacionId,
    seccionId
  );
}

export function eliminarSeccionDeSimulacion(db: BaseDatos, simulacionId: number, seccionId: number): void {
  db.prepare("DELETE FROM simulacion_seccion WHERE simulacion_id = ? AND seccion_id = ?").run(
    simulacionId,
    seccionId
  );
}

export function calcularCreditos(db: BaseDatos, simulacionId: number): number {
  const fila = db
    .prepare(
      "SELECT COALESCE(SUM(a.creditos), 0) AS total FROM simulacion_seccion ss " +
        "JOIN seccion s ON s.id = ss.seccion_id " +
        "JOIN asignatura a ON a.id = s.asignatura_id " +
        "WHERE ss.simulacion_id = ?"
    )
    .get(simulacionId) as { total: number };
  return fila.total;
}

export function obtenerEstudianteDemo(db: BaseDatos): { id: number; nombre: string; rut: string } | null {
  const fila = db.prepare("SELECT id, nombre, rut FROM estudiante ORDER BY id LIMIT 1").get() as
    | { id: number; nombre: string; rut: string }
    | undefined;
  return fila ?? null;
}

export function obtenerTopeCreditos(db: BaseDatos, estudianteId: number): number {
  const fila = db
    .prepare(
      "SELECT c.tope_creditos_semestre AS tope FROM estudiante e " +
        "JOIN carrera c ON c.id = e.carrera_id WHERE e.id = ?"
    )
    .get(estudianteId) as { tope: number } | undefined;
  if (!fila) {
    throw new Error("No se encontró la carrera del estudiante");
  }
  return fila.tope;
}

export function obtenerMetricasSeccion(
  db: BaseDatos,
  asignaturaId: number,
  docente: string
): MetricasSeccion {
  const fila = db
    .prepare(
      "SELECT COUNT(*) AS total, AVG(calificacion_docente) AS valoracion, " +
        "AVG(dificultad_percibida) AS dificultad FROM evaluacion " +
        "WHERE asignatura_id = ? AND docente = ?"
    )
    .get(asignaturaId, docente) as FilaMetricas;

  if (fila.total === 0 || fila.valoracion === null || fila.dificultad === null) {
    return { total: 0, valoracionDocente: null, dificultad: null };
  }

  return {
    total: fila.total,
    valoracionDocente: redondearUnDecimal(fila.valoracion),
    dificultad: redondearUnDecimal(fila.dificultad),
  };
}
