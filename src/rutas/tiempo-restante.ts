import { Router } from "express";
import type { BaseDatos } from "../db/conexion";
import { obtenerEstudianteDemo } from "../dominio/repositorios";
import { calcularTiempoRestante } from "../dominio/tiempo-restante";
import type { SimulacionTiempo } from "../dominio/tipos";

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

function urlConError(mensaje: string): string {
  return `/tiempo-restante?error=${encodeURIComponent(mensaje)}`;
}

export function crearRutasTiempoRestante(db: BaseDatos): Router {
  const router = Router();

  router.get("/tiempo-restante", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      res.status(500).send("No hay estudiante de ejemplo. Ejecuta npm run db:seed.");
      return;
    }

    const asignaturaId = Number(req.query.asignatura_id);
    const accion = req.query.accion;
    let simulacion: SimulacionTiempo | undefined;
    if (
      Number.isInteger(asignaturaId) &&
      asignaturaId > 0 &&
      (accion === "reprobar" || accion === "postergar")
    ) {
      simulacion = { asignaturaId, accion };
    }

    let resultado;
    try {
      resultado = calcularTiempoRestante(db, estudiante.id, simulacion);
    } catch (error) {
      res.redirect(urlConError(error instanceof Error ? error.message : "No se pudo calcular el tiempo restante"));
      return;
    }

    const rol = leerCookie(req.headers.cookie, "rol") ?? "estudiante";
    res.render("tiempo-restante", {
      estudiante,
      resultado,
      rol,
      rolEtiqueta: "Estudiante",
      ok: "",
      error: typeof req.query.error === "string" ? req.query.error : "",
    });
  });

  router.post("/tiempo-restante/simular", (req, res) => {
    const asignaturaId = Number(req.body?.asignatura_id);
    const accion = typeof req.body?.accion === "string" ? req.body.accion : "";

    if (!Number.isInteger(asignaturaId) || asignaturaId <= 0) {
      res.redirect(urlConError("La asignatura simulada no es válida"));
      return;
    }
    if (accion !== "reprobar" && accion !== "postergar") {
      res.redirect(urlConError("La acción simulada debe ser «reprobar» o «postergar»"));
      return;
    }

    res.redirect(`/tiempo-restante?asignatura_id=${asignaturaId}&accion=${accion}`);
  });

  return router;
}
