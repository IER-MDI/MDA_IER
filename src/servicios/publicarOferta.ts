import type { BaseDatos } from "../db/conexion";
import { aplicarTransicion, type EstadoOferta } from "../dominio/estadoOferta";
import type { FilaPlanilla } from "./leerPlanilla";
import type { FilaInvalida, Mapeo, SeccionParseada } from "./parsearOferta";

export interface Borrador {
  periodo: string;
  encabezados: string[];
  filasPlanilla: FilaPlanilla[];
  mapeo: Mapeo;
  filas: SeccionParseada[];
  errores: FilaInvalida[];
}

interface FilaOferta {
  id: number;
  periodo: string;
  estado: EstadoOferta;
  borrador: string | null;
}

export function obtenerOferta(db: BaseDatos, id: number): FilaOferta | null {
  const fila = db
    .prepare("SELECT id, periodo, estado, borrador FROM oferta_academica WHERE id = ?")
    .get(id) as FilaOferta | undefined;
  return fila ?? null;
}

export function existePeriodo(db: BaseDatos, periodo: string): boolean {
  const fila = db
    .prepare("SELECT 1 AS existe FROM oferta_academica WHERE periodo = ?")
    .get(periodo) as { existe: number } | undefined;
  return fila !== undefined;
}

/** Crea la fila de oferta en «Archivo recibido» sin duplicar un período. */
export function crearCarga(db: BaseDatos, periodo: string): number {
  if (existePeriodo(db, periodo)) {
    throw new Error(`La oferta ${periodo} ya está publicada`);
  }
  const resultado = db
    .prepare(
      "INSERT INTO oferta_academica (periodo, fecha_publicacion, estado) VALUES (?, '', 'Archivo recibido')"
    )
    .run(periodo);
  return Number(resultado.lastInsertRowid);
}

export function guardarBorrador(
  db: BaseDatos,
  id: number,
  estado: EstadoOferta,
  borrador: Borrador
): void {
  db.prepare("UPDATE oferta_academica SET estado = ?, borrador = ? WHERE id = ?").run(
    estado,
    JSON.stringify(borrador),
    id
  );
}

export function cambiarEstado(db: BaseDatos, id: number, estado: EstadoOferta): void {
  db.prepare("UPDATE oferta_academica SET estado = ? WHERE id = ?").run(estado, id);
}

export function leerBorrador(db: BaseDatos, id: number): Borrador | null {
  const oferta = obtenerOferta(db, id);
  if (!oferta?.borrador) {
    return null;
  }
  try {
    return JSON.parse(oferta.borrador) as Borrador;
  } catch {
    return null;
  }
}

/** Aplica la transición final de EST-01 y persiste toda la oferta en una transacción. */
export function publicarOferta(db: BaseDatos, id: number): number {
  const oferta = obtenerOferta(db, id);
  if (!oferta) {
    throw new Error("No se encontró la carga de la oferta");
  }
  const borrador = leerBorrador(db, id);
  if (!borrador) {
    throw new Error("No hay datos en revisión para publicar");
  }
  if (borrador.filas.length === 0) {
    throw new Error("Sin secciones válidas: no se publicó la oferta");
  }

  const estadoFinal = aplicarTransicion(oferta.estado, "confirmarPublicacion");
  if (estadoFinal !== "Publicada") {
    throw new Error("La oferta no está lista para publicarse");
  }

  db.transaction(() => {
    const duplicada = db
      .prepare("SELECT 1 AS existe FROM oferta_academica WHERE periodo = ? AND id <> ?")
      .get(borrador.periodo, id) as { existe: number } | undefined;
    if (duplicada) {
      throw new Error(`La oferta ${borrador.periodo} ya está publicada`);
    }

    const insertarAsignatura = db.prepare(
      "INSERT INTO asignatura (codigo, nombre, creditos, semestre_sugerido) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT (codigo) DO UPDATE SET nombre = excluded.nombre, creditos = excluded.creditos, " +
        "semestre_sugerido = excluded.semestre_sugerido"
    );
    const buscarAsignatura = db.prepare("SELECT id FROM asignatura WHERE codigo = ?");
    const insertarSeccion = db.prepare(
      "INSERT INTO seccion (oferta_id, asignatura_id, numero, docente, cupos) VALUES (?, ?, ?, ?, ?)"
    );
    const insertarBloque = db.prepare(
      "INSERT INTO bloque_horario (seccion_id, dia, hora_inicio, hora_fin) VALUES (?, ?, ?, ?)"
    );

    for (const fila of borrador.filas) {
      insertarAsignatura.run(fila.codigo, fila.nombre, fila.creditos, fila.semestreSugerido);
      const asignatura = buscarAsignatura.get(fila.codigo) as { id: number };
      const seccion = insertarSeccion.run(
        id,
        asignatura.id,
        fila.numero,
        fila.docente,
        fila.cupos
      );
      const seccionId = Number(seccion.lastInsertRowid);
      for (const bloque of fila.bloques) {
        insertarBloque.run(seccionId, bloque.dia, bloque.horaInicio, bloque.horaFin);
      }
    }

    db.prepare(
      "DELETE FROM simulacion_seccion WHERE seccion_id IN " +
        "(SELECT s.id FROM seccion s WHERE s.oferta_id <> ?)"
    ).run(id);

    db.prepare(
      "UPDATE oferta_academica SET estado = 'Publicada', fecha_publicacion = ?, borrador = NULL WHERE id = ?"
    ).run(fechaHoy(), id);
  })();

  return id;
}

export function cancelarCarga(db: BaseDatos, id: number): void {
  const oferta = obtenerOferta(db, id);
  if (!oferta || oferta.estado === "Publicada") {
    return;
  }
  db.prepare("DELETE FROM oferta_academica WHERE id = ?").run(id);
}

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10);
}
