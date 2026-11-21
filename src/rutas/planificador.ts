import { Router } from "express";
import type { BaseDatos } from "../db/conexion";
import { textoHorario } from "../dominio/horario";
import {
  listarSeccionesDisponibles,
  obtenerEstudianteDemo,
  obtenerTopeCreditos,
} from "../dominio/repositorios";
import { DIAS, ETIQUETAS_DIA, FRANJAS, type Seccion } from "../dominio/tipos";
import {
  agregarSeccion,
  calcularCreditos,
  listarSeccionesIncluidas,
  obtenerSimulacionActivaDelEstudiante,
  removerSeccion,
} from "../servicios/simulacion";

function leerCookie(cabecera: string | undefined, nombre: string): string | undefined {
  if (!cabecera) {
    return undefined;
  }
  for (const parte of cabecera.split(";")) {
    const [clave, ...resto] = parte.trim().split("=");
    if (clave === nombre) {
      return decodeURIComponent(resto.join("="));
    }
  }
  return undefined;
}

function seccionesParaVista(secciones: Seccion[]) {
  return secciones.map((seccion) => ({
    ...seccion,
    horarioTexto: textoHorario(seccion.bloques),
  }));
}

export function crearRutasPlanificador(db: BaseDatos): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.redirect("/planificador");
  });

  router.post("/rol", (req, res) => {
    const solicitado = typeof req.body?.rol === "string" ? req.body.rol : "estudiante";
    const rol = solicitado === "estudiante" ? "estudiante" : "estudiante";
    res.cookie("rol", rol);
    res.redirect("/planificador");
  });

  router.get("/planificador", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      res.status(500).send("No hay estudiante de ejemplo. Ejecuta npm run db:seed.");
      return;
    }

    const simulacion = obtenerSimulacionActivaDelEstudiante(db, estudiante.id);
    const secciones = listarSeccionesDisponibles(db, simulacion.id);
    const incluidas = listarSeccionesIncluidas(db, simulacion.id);
    const totalCreditos = calcularCreditos(db, simulacion.id);
    const tope = obtenerTopeCreditos(db, estudiante.id);

    const grilla = FRANJAS.map((franja) => ({
      etiqueta: `${franja.inicio}–${franja.fin}`,
      celdas: DIAS.map((dia) => ({
        dia,
        etiqueta: ETIQUETAS_DIA[dia] ?? dia,
        secciones: incluidas.filter((seccion) =>
          seccion.bloques.some(
            (bloque) =>
              bloque.dia === dia && bloque.horaInicio < franja.fin && franja.inicio < bloque.horaFin
          )
        ),
      })),
    }));

    const rol = leerCookie(req.headers.cookie, "rol") ?? "estudiante";

    res.render("planificador", {
      estudiante,
      simulacion,
      secciones: seccionesParaVista(secciones),
      incluidas: seccionesParaVista(incluidas),
      grilla,
      totalCreditos,
      tope,
      ok: typeof req.query.ok === "string" ? req.query.ok : "",
      error: typeof req.query.error === "string" ? req.query.error : "",
      rol,
      rolEtiqueta: rol === "estudiante" ? "Estudiante" : "Estudiante",
    });
  });

  router.post("/planificador/secciones", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      res.status(500).send("No hay estudiante de ejemplo. Ejecuta npm run db:seed.");
      return;
    }
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, estudiante.id);
    const seccionId = Number(req.body?.seccion_id);

    if (!Number.isInteger(seccionId) || seccionId <= 0) {
      res.redirect(`/planificador?error=${encodeURIComponent("La sección solicitada no es válida")}`);
      return;
    }

    const resultado = agregarSeccion(db, simulacion.id, seccionId);
    if (resultado.tipo === "ok") {
      res.redirect(`/planificador?ok=${encodeURIComponent("La sección se agregó a tu horario")}`);
      return;
    }
    if (resultado.tipo === "choque") {
      const seccion = resultado.seccionEnConflicto;
      const mensaje = `Choque de horario con ${seccion.asignatura.nombre} sección ${seccion.numero}`;
      res.redirect(`/planificador?error=${encodeURIComponent(mensaje)}`);
      return;
    }
    const mensaje = `Se superaría el tope de créditos: ${resultado.totalCreditos} de ${resultado.tope}`;
    res.redirect(`/planificador?error=${encodeURIComponent(mensaje)}`);
  });

  router.post("/planificador/secciones/:id/eliminar", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      res.status(500).send("No hay estudiante de ejemplo. Ejecuta npm run db:seed.");
      return;
    }
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, estudiante.id);
    const seccionId = Number(req.params.id);
    if (!Number.isInteger(seccionId) || seccionId <= 0) {
      res.redirect(`/planificador?error=${encodeURIComponent("La sección solicitada no es válida")}`);
      return;
    }
    removerSeccion(db, simulacion.id, seccionId);
    res.redirect(`/planificador?ok=${encodeURIComponent("La sección se quitó de tu horario")}`);
  });

  return router;
}
