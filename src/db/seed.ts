import path from "node:path";
import { fileURLToPath } from "node:url";
import { crearBase, type BaseDatos } from "./conexion";

type BloqueSemilla = [dia: string, horaInicio: string, horaFin: string];

interface AsignaturaSemilla {
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: number;
  docente: string;
  bloques: BloqueSemilla[];
}

interface EvaluacionSemilla {
  codigoAsignatura: string;
  docente: string;
  calificacion: number;
  dificultad: number;
  comentario?: string;
}

const CARRERA = {
  nombre: "Ingeniería Civil Informática",
  duracionSemestres: 10,
  topeCreditosSemestre: 30,
};

const ESTUDIANTE = {
  nombre: "Estudiante Demo",
  rut: "11.111.111-1",
};

const OFERTA = {
  periodo: "2026-2",
  fechaPublicacion: "2026-07-15",
};

const ASIGNATURAS: AsignaturaSemilla[] = [
  {
    codigo: "MAT101",
    nombre: "Cálculo I",
    creditos: 5,
    semestre: 1,
    docente: "Prof. Ana Pérez",
    bloques: [
      ["lunes", "08:30", "09:50"],
      ["miercoles", "08:30", "09:50"],
    ],
  },
  {
    codigo: "MAT102",
    nombre: "Cálculo II",
    creditos: 6,
    semestre: 2,
    docente: "Prof. Ana Pérez",
    bloques: [
      ["martes", "10:00", "11:20"],
      ["jueves", "10:00", "11:20"],
    ],
  },
  {
    codigo: "FIS101",
    nombre: "Física I",
    creditos: 6,
    semestre: 1,
    docente: "Prof. Bruno Silva",
    bloques: [
      ["lunes", "09:00", "10:20"],
      ["miercoles", "09:00", "10:20"],
    ],
  },
  {
    codigo: "PROG101",
    nombre: "Programación",
    creditos: 6,
    semestre: 1,
    docente: "Prof. Carla Rojas",
    bloques: [
      ["martes", "08:30", "09:50"],
      ["jueves", "08:30", "09:50"],
    ],
  },
  {
    codigo: "BD101",
    nombre: "Bases de Datos",
    creditos: 6,
    semestre: 4,
    docente: "Prof. Diego Fuentes",
    bloques: [
      ["miercoles", "10:00", "11:20"],
      ["viernes", "10:00", "11:20"],
    ],
  },
  {
    codigo: "ING101",
    nombre: "Inglés Técnico",
    creditos: 5,
    semestre: 2,
    docente: "Prof. Elena Vidal",
    bloques: [
      ["jueves", "10:00", "11:20"],
      ["viernes", "08:30", "09:50"],
    ],
  },
  {
    codigo: "ECO101",
    nombre: "Economía",
    creditos: 6,
    semestre: 3,
    docente: "Prof. Felipe Soto",
    bloques: [
      ["lunes", "10:00", "11:20"],
      ["martes", "10:00", "11:20"],
    ],
  },
  {
    codigo: "HUM101",
    nombre: "Ética Profesional",
    creditos: 5,
    semestre: 5,
    docente: "Prof. Gabriela Núñez",
    bloques: [["sabado", "10:00", "11:20"]],
  },
];

const EVALUACIONES: EvaluacionSemilla[] = [
  { codigoAsignatura: "MAT101", docente: "Prof. Ana Pérez", calificacion: 5, dificultad: 4 },
  { codigoAsignatura: "MAT101", docente: "Prof. Ana Pérez", calificacion: 3, dificultad: 4 },
  { codigoAsignatura: "MAT101", docente: "Prof. Ana Pérez", calificacion: 4, dificultad: 5 },
];

export function sembrar(db: BaseDatos): void {
  db.transaction(() => {
    db.prepare(
      "INSERT INTO carrera (nombre, duracion_semestres, tope_creditos_semestre) VALUES (?, ?, ?) " +
        "ON CONFLICT (nombre) DO NOTHING"
    ).run(CARRERA.nombre, CARRERA.duracionSemestres, CARRERA.topeCreditosSemestre);

    const carreraId = idDe(db, "SELECT id FROM carrera WHERE nombre = ?", CARRERA.nombre);

    db.prepare(
      "INSERT INTO estudiante (nombre, rut, carrera_id) VALUES (?, ?, ?) ON CONFLICT (rut) DO NOTHING"
    ).run(ESTUDIANTE.nombre, ESTUDIANTE.rut, carreraId);

    db.prepare(
      "INSERT INTO oferta_academica (periodo, fecha_publicacion) VALUES (?, ?) ON CONFLICT (periodo) DO NOTHING"
    ).run(OFERTA.periodo, OFERTA.fechaPublicacion);

    const ofertaId = idDe(db, "SELECT id FROM oferta_academica WHERE periodo = ?", OFERTA.periodo);

    const insertarAsignatura = db.prepare(
      "INSERT INTO asignatura (codigo, nombre, creditos, semestre_sugerido) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT (codigo) DO NOTHING"
    );
    const insertarSeccion = db.prepare(
      "INSERT INTO seccion (oferta_id, asignatura_id, numero, docente, cupos) VALUES (?, ?, 1, ?, 30) " +
        "ON CONFLICT (oferta_id, asignatura_id, numero) DO NOTHING"
    );
    const insertarBloque = db.prepare(
      "INSERT INTO bloque_horario (seccion_id, dia, hora_inicio, hora_fin) VALUES (?, ?, ?, ?) " +
        "ON CONFLICT (seccion_id, dia, hora_inicio, hora_fin) DO NOTHING"
    );

    for (const asignatura of ASIGNATURAS) {
      insertarAsignatura.run(asignatura.codigo, asignatura.nombre, asignatura.creditos, asignatura.semestre);
      const asignaturaId = idDe(db, "SELECT id FROM asignatura WHERE codigo = ?", asignatura.codigo);
      insertarSeccion.run(ofertaId, asignaturaId, asignatura.docente);
      const seccionId = idDe(
        db,
        "SELECT id FROM seccion WHERE oferta_id = ? AND asignatura_id = ? AND numero = 1",
        ofertaId,
        asignaturaId
      );
      for (const [dia, horaInicio, horaFin] of asignatura.bloques) {
        insertarBloque.run(seccionId, dia, horaInicio, horaFin);
      }
    }

    const evaluacionesExistentes = db.prepare("SELECT COUNT(*) AS total FROM evaluacion").get() as {
      total: number;
    };
    if (evaluacionesExistentes.total === 0) {
      const insertarEvaluacion = db.prepare(
        "INSERT INTO evaluacion (asignatura_id, docente, calificacion_docente, dificultad_percibida, comentario) " +
          "VALUES (?, ?, ?, ?, ?)"
      );
      for (const evaluacion of EVALUACIONES) {
        const asignaturaId = idDe(db, "SELECT id FROM asignatura WHERE codigo = ?", evaluacion.codigoAsignatura);
        insertarEvaluacion.run(
          asignaturaId,
          evaluacion.docente,
          evaluacion.calificacion,
          evaluacion.dificultad,
          evaluacion.comentario ?? null
        );
      }
    }
  })();
}

function idDe(db: BaseDatos, sql: string, ...parametros: unknown[]): number {
  const fila = db.prepare(sql).get(...parametros) as { id: number } | undefined;
  if (!fila) {
    throw new Error(`No se encontró el registro para: ${sql}`);
  }
  return fila.id;
}

const ejecutadoDirectamente =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (ejecutadoDirectamente) {
  const db = crearBase();
  sembrar(db);
  const secciones = db.prepare("SELECT COUNT(*) AS total FROM seccion").get() as { total: number };
  const bloques = db.prepare("SELECT COUNT(*) AS total FROM bloque_horario").get() as { total: number };
  const evaluaciones = db.prepare("SELECT COUNT(*) AS total FROM evaluacion").get() as { total: number };
  console.log(
    `Datos de ejemplo cargados: ${secciones.total} secciones, ${bloques.total} bloques horarios y ` +
      `${evaluaciones.total} evaluaciones.`
  );
  db.close();
}
