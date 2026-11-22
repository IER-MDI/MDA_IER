import type { BaseDatos } from "../db/conexion";
import {
  listarAsignaturasDeMalla,
  listarCodigosAprobados,
  listarPrerrequisitos,
  obtenerCarreraDelEstudiante,
} from "./repositorios";
import type { ResultadoTiempoRestante, SimulacionTiempo } from "./tipos";

interface Ruta {
  longitud: number;
  nodos: number[];
}

export function calcularTiempoRestante(
  db: BaseDatos,
  estudianteId: number,
  simulacion?: SimulacionTiempo
): ResultadoTiempoRestante {
  const carrera = obtenerCarreraDelEstudiante(db, estudianteId);
  if (!carrera) {
    throw new Error("No se encontró la carrera del estudiante");
  }

  const malla = listarAsignaturasDeMalla(db, carrera.id);
  const aprobados = new Set(listarCodigosAprobados(db, estudianteId));
  const pendientes = malla.filter((asignatura) => !aprobados.has(asignatura.codigo));
  const pendientesPorId = new Map(pendientes.map((asignatura) => [asignatura.id, asignatura]));

  const sucesores = new Map<number, number[]>();
  for (const id of pendientesPorId.keys()) {
    sucesores.set(id, []);
  }
  for (const prerrequisito of listarPrerrequisitos(db)) {
    if (
      pendientesPorId.has(prerrequisito.asignaturaId) &&
      pendientesPorId.has(prerrequisito.prerrequisitoId)
    ) {
      sucesores.get(prerrequisito.prerrequisitoId)?.push(prerrequisito.asignaturaId);
    }
  }

  const memo = new Map<number, Ruta>();
  const enRecorrido = new Set<number>();

  function mejorRutaDesde(id: number): Ruta {
    const calculada = memo.get(id);
    if (calculada) {
      return calculada;
    }
    if (enRecorrido.has(id)) {
      throw new Error("Los prerrequisitos de la malla forman un ciclo");
    }

    enRecorrido.add(id);
    let mejor: Ruta = { longitud: 1, nodos: [id] };
    for (const siguiente of sucesores.get(id) ?? []) {
      const candidata = mejorRutaDesde(siguiente);
      if (candidata.longitud + 1 > mejor.longitud) {
        mejor = { longitud: candidata.longitud + 1, nodos: [id, ...candidata.nodos] };
      }
    }
    enRecorrido.delete(id);
    memo.set(id, mejor);
    return mejor;
  }

  let minimoSemestres = 0;
  const criticos = new Set<number>();
  for (const id of pendientesPorId.keys()) {
    const ruta = mejorRutaDesde(id);
    if (ruta.longitud > minimoSemestres) {
      minimoSemestres = ruta.longitud;
      criticos.clear();
      for (const nodo of ruta.nodos) {
        criticos.add(nodo);
      }
    } else if (ruta.longitud === minimoSemestres) {
      for (const nodo of ruta.nodos) {
        criticos.add(nodo);
      }
    }
  }

  const pendientesParaVista = pendientes.map((asignatura) => ({
    ...asignatura,
    critica: criticos.has(asignatura.id),
  }));
  const cadenaCritica = pendientes.filter((asignatura) => criticos.has(asignatura.id)).map((asignatura) => asignatura.id);

  let simulacionParaVista: ResultadoTiempoRestante["simulacion"] = null;
  if (simulacion) {
    if (simulacion.accion !== "reprobar" && simulacion.accion !== "postergar") {
      throw new Error("La acción simulada debe ser «reprobar» o «postergar»");
    }
    const asignatura = pendientesPorId.get(simulacion.asignaturaId);
    if (!asignatura) {
      throw new Error("La asignatura simulada no es una asignatura pendiente de la malla");
    }
    const esCritica = criticos.has(asignatura.id);
    const retraso = esCritica ? 1 : 0;
    simulacionParaVista = {
      codigo: asignatura.codigo,
      nombre: asignatura.nombre,
      accion: simulacion.accion,
      esCritica,
      minimoSemestres: minimoSemestres + retraso,
      retraso,
    };
  }

  return {
    minimoSemestres,
    pendientes: pendientesParaVista,
    cadenaCritica,
    simulacion: simulacionParaVista,
  };
}
