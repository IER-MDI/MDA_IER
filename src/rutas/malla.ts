import { Router } from "express";
import type { BaseDatos } from "../db/conexion";
import { calcularCadena, calcularEstado } from "../dominio/malla";
import {
  listarAvance,
  listarMalla,
  listarPrerrequisitos,
  obtenerCarreraDelEstudiante,
  obtenerEstudianteDemo,
} from "../dominio/repositorios";
import type { AsignaturaEnMalla, EstadoAsignatura, ResultadoAsignatura } from "../dominio/tipos";

const ETIQUETAS_ESTADO: Record<EstadoAsignatura, string> = {
  aprobada: "Aprobada",
  disponible: "Disponible",
  bloqueada: "Bloqueada",
};

const ETIQUETAS_RESULTADO: Record<ResultadoAsignatura, string> = {
  aprobada: "Aprobada",
  reprobada: "Reprobada",
  "en curso": "En curso",
};

function buscarAsignaturas(malla: AsignaturaEnMalla[], ids: number[]): AsignaturaEnMalla[] {
  return ids
    .map((id) => malla.find((asignatura) => asignatura.id === id))
    .filter((asignatura): asignatura is AsignaturaEnMalla => asignatura !== undefined);
}

export function crearRutasMalla(db: BaseDatos): Router {
  const router = Router();

  router.get("/malla", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      res.status(500).send("No hay estudiante de ejemplo. Ejecuta npm run db:seed.");
      return;
    }

    const carrera = obtenerCarreraDelEstudiante(db, estudiante.id);
    if (!carrera) {
      res.status(500).send("No se encontró la carrera del estudiante. Ejecuta npm run db:seed.");
      return;
    }

    const malla = listarMalla(db, carrera.id);
    const prerrequisitos = listarPrerrequisitos(db);
    const avance = listarAvance(db, estudiante.id);
    const aprobadas = new Set(
      [...avance.entries()]
        .filter(([, resultado]) => resultado === "aprobada")
        .map(([asignaturaId]) => asignaturaId)
    );

    const codigoSeleccionado =
      typeof req.query.asignatura === "string" ? req.query.asignatura : null;
    const seleccionadaBase = codigoSeleccionado
      ? malla.find((asignatura) => asignatura.codigo === codigoSeleccionado)
      : undefined;

    let cadena = {
      prerrequisitos: [] as AsignaturaEnMalla[],
      dependientes: [] as AsignaturaEnMalla[],
    };
    let idsCadena = new Set<number>();

    if (seleccionadaBase) {
      const calculo = calcularCadena(seleccionadaBase.id, prerrequisitos);
      cadena = {
        prerrequisitos: buscarAsignaturas(malla, calculo.prerrequisitos),
        dependientes: buscarAsignaturas(malla, calculo.dependientes),
      };
      idsCadena = new Set([...calculo.prerrequisitos, ...calculo.dependientes]);
    }

    const asignaturas = malla.map((asignatura) => {
      const estado = calcularEstado(asignatura.id, aprobadas, prerrequisitos);
      const resultado = avance.get(asignatura.id) ?? null;
      const clase = !seleccionadaBase
        ? ""
        : asignatura.id === seleccionadaBase.id
          ? "seleccionada"
          : idsCadena.has(asignatura.id)
            ? "relacionada"
            : "atenuada";
      return {
        ...asignatura,
        estado,
        etiquetaEstado: ETIQUETAS_ESTADO[estado],
        resultado,
        etiquetaResultado:
          resultado !== null && resultado !== "aprobada" ? ETIQUETAS_RESULTADO[resultado] : null,
        clase,
      };
    });

    const semestres = [...new Set(asignaturas.map((asignatura) => asignatura.semestreSugerido))]
      .sort((a, b) => a - b)
      .map((semestre) => ({
        semestre,
        asignaturas: asignaturas.filter((asignatura) => asignatura.semestreSugerido === semestre),
      }));

    const seleccionada = seleccionadaBase
      ? asignaturas.find((asignatura) => asignatura.id === seleccionadaBase.id) ?? null
      : null;

    res.render("malla", {
      estudiante,
      carrera,
      semestres,
      seleccionada,
      cadena,
      rol: "estudiante",
      rolEtiqueta: "Estudiante",
      tituloPagina: "SGAI — Malla interactiva",
    });
  });

  return router;
}
