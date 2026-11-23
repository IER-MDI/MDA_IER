import type { BaseDatos } from "../db/conexion";
import { redondearUnDecimal } from "./metricas";
import type {
  AsignaturaEnMalla,
  Bloque,
  MetricasSeccion,
  ResultadoAsignatura,
  Seccion,
  Simulacion,
} from "./tipos";

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

interface FilaMalla {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre_sugerido: number;
}

interface FilaPrerrequisito {
  asignatura_id: number;
  prerrequisito_id: number;
}

interface FilaAvance {
  asignatura_id: number;
  resultado: ResultadoAsignatura;
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

export interface OfertaActiva {
  id: number;
  periodo: string;
  fechaPublicacion: string;
}

/** Última oferta publicada; es la única que consume el simulador. */
export function ofertaPublicadaActiva(db: BaseDatos): OfertaActiva | null {
  const fila = db
    .prepare(
      "SELECT id, periodo, fecha_publicacion FROM oferta_academica " +
        "WHERE estado = 'Publicada' ORDER BY fecha_publicacion DESC, id DESC LIMIT 1"
    )
    .get() as { id: number; periodo: string; fecha_publicacion: string } | undefined;
  return fila
    ? { id: fila.id, periodo: fila.periodo, fechaPublicacion: fila.fecha_publicacion }
    : null;
}

export function listarSeccionesDisponibles(db: BaseDatos, simulacionId: number): Seccion[] {
  const activa = ofertaPublicadaActiva(db);
  if (!activa) {
    return [];
  }
  const filas = db
    .prepare(
      SELECT_SECCION +
        "JOIN oferta_academica o ON o.id = s.oferta_id " +
        "WHERE o.id = ? AND s.id NOT IN " +
        "(SELECT seccion_id FROM simulacion_seccion WHERE simulacion_id = ?) " +
        "ORDER BY a.codigo, s.numero"
    )
    .all(activa.id, simulacionId) as FilaSeccion[];
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
  const activa = ofertaPublicadaActiva(db);
  if (!activa) {
    return [];
  }
  const filas = db
    .prepare(
      SELECT_SECCION +
        "JOIN simulacion_seccion ss ON ss.seccion_id = s.id " +
        "JOIN oferta_academica o ON o.id = s.oferta_id " +
        "WHERE ss.simulacion_id = ? AND o.id = ? ORDER BY a.codigo, s.numero"
    )
    .all(simulacionId, activa.id) as FilaSeccion[];
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
  const activa = ofertaPublicadaActiva(db);
  if (!activa) {
    return 0;
  }
  const fila = db
    .prepare(
      "SELECT COALESCE(SUM(a.creditos), 0) AS total FROM simulacion_seccion ss " +
        "JOIN seccion s ON s.id = ss.seccion_id " +
        "JOIN asignatura a ON a.id = s.asignatura_id " +
        "JOIN oferta_academica o ON o.id = s.oferta_id " +
        "WHERE ss.simulacion_id = ? AND o.id = ?"
    )
    .get(simulacionId, activa.id) as { total: number };
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

export function obtenerCarreraDelEstudiante(
  db: BaseDatos,
  estudianteId: number
): { id: number; nombre: string } | null {
  const fila = db
    .prepare(
      "SELECT c.id, c.nombre FROM estudiante e JOIN carrera c ON c.id = e.carrera_id WHERE e.id = ?"
    )
    .get(estudianteId) as { id: number; nombre: string } | undefined;
  return fila ?? null;
}

export function listarMalla(db: BaseDatos, carreraId: number): AsignaturaEnMalla[] {
  const filas = db
    .prepare(
      "SELECT a.id, a.codigo, a.nombre, a.creditos, a.semestre_sugerido " +
        "FROM carrera_asignatura ca JOIN asignatura a ON a.id = ca.asignatura_id " +
        "WHERE ca.carrera_id = ? ORDER BY a.semestre_sugerido, a.codigo"
    )
    .all(carreraId) as FilaMalla[];
  return filas.map((fila) => ({
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    creditos: fila.creditos,
    semestreSugerido: fila.semestre_sugerido,
  }));
}

export function listarAsignaturasDeMalla(db: BaseDatos, carreraId: number): AsignaturaEnMalla[] {
  return listarMalla(db, carreraId);
}

export function listarPrerrequisitos(db: BaseDatos): Map<number, number[]> {
  const filas = db
    .prepare(
      "SELECT asignatura_id, prerrequisito_id FROM asignatura_prerrequisito " +
        "ORDER BY asignatura_id, prerrequisito_id"
    )
    .all() as FilaPrerrequisito[];

  const mapa = new Map<number, number[]>();
  for (const fila of filas) {
    const lista = mapa.get(fila.asignatura_id) ?? [];
    lista.push(fila.prerrequisito_id);
    mapa.set(fila.asignatura_id, lista);
  }
  return mapa;
}

export function listarAvance(db: BaseDatos, estudianteId: number): Map<number, ResultadoAsignatura> {
  const filas = db
    .prepare("SELECT asignatura_id, resultado FROM asignatura_cursada WHERE estudiante_id = ?")
    .all(estudianteId) as FilaAvance[];
  return new Map(filas.map((fila) => [fila.asignatura_id, fila.resultado]));
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

export function listarCodigosAprobados(db: BaseDatos, estudianteId: number): string[] {
  const filas = db
    .prepare(
      "SELECT DISTINCT a.codigo FROM asignatura_cursada ac " +
        "JOIN asignatura a ON a.id = ac.asignatura_id " +
        "WHERE ac.estudiante_id = ? AND ac.resultado = 'aprobada' ORDER BY a.codigo"
    )
    .all(estudianteId) as { codigo: string }[];
  return filas.map((fila) => fila.codigo);
}
