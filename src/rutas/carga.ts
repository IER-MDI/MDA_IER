import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router, type Response } from "express";
import multer from "multer";
import type { BaseDatos } from "../db/conexion";
import { aplicarTransicion } from "../dominio/estadoOferta";
import { obtenerEstudianteDemo } from "../dominio/repositorios";
import { leerPlanilla } from "../servicios/leerPlanilla";
import {
  CAMPOS,
  mapeoPorDefecto,
  parsearOferta,
  type Mapeo,
} from "../servicios/parsearOferta";
import {
  cancelarCarga,
  crearCarga,
  guardarBorrador,
  leerBorrador,
  obtenerOferta,
  publicarOferta,
  type Borrador,
} from "../servicios/publicarOferta";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const archivoEjemplo = path.join(aqui, "..", "..", "datos", "ejemplo-oferta-2026-3.csv");
const subida = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

export function crearRutasCarga(db: BaseDatos): Router {
  const router = Router();

  function render(
    res: Response,
    estudiante: { nombre: string },
    rol: string,
    datos: Record<string, unknown> = {}
  ): void {
    res.render("carga", {
      estudiante,
      rol,
      rolEtiqueta: rol === "administrador" ? "Administrador comunitario" : "Estudiante",
      tituloPagina: "SGAI — Carga de oferta académica",
      campos: CAMPOS,
      ok: "",
      error: "",
      id: null,
      estado: "",
      borrador: null,
      ...datos,
    });
  }

  function sinEstudiante(res: Response): void {
    res.status(500).send("No hay estudiante de ejemplo. Ejecuta npm run db:seed.");
  }

  router.get("/carga", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      sinEstudiante(res);
      return;
    }
    render(res, estudiante, leerCookie(req.headers.cookie, "rol") ?? "estudiante", {
      ok: texto(req.query.ok),
      error: texto(req.query.error),
    });
  });

  router.get("/carga/ejemplo", (_req, res) => {
    res.download(archivoEjemplo, "ejemplo-oferta-2026-3.csv");
  });

  router.post("/carga/archivo", subida.single("archivo"), async (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      sinEstudiante(res);
      return;
    }
    const rol = leerCookie(req.headers.cookie, "rol") ?? "estudiante";
    const archivo = req.file;
    if (!archivo) {
      render(res, estudiante, rol, { error: "Seleccione un archivo .xlsx o .csv" });
      return;
    }

    const extension = path.extname(archivo.originalname).toLowerCase();
    if (extension !== ".xlsx" && extension !== ".csv") {
      render(res, estudiante, rol, { error: "Formato no admitido: use .xlsx o .csv" });
      return;
    }

    try {
      const planilla = await leerPlanilla(archivo.buffer, extension);
      const mapeo = mapeoPorDefecto(planilla.encabezados);
      const parseo = parsearOferta(planilla, mapeo);
      if (!parseo.periodo) {
        render(res, estudiante, rol, { error: "Sin período: no se publicó la oferta" });
        return;
      }

      const id = crearCarga(db, parseo.periodo);
      const estado = aplicarTransicion("Archivo recibido", "evaluarFormato", true);
      const borrador: Borrador = {
        periodo: parseo.periodo,
        encabezados: parseo.encabezados,
        filasPlanilla: planilla.filas,
        mapeo: parseo.mapeo,
        filas: parseo.filas,
        errores: parseo.errores,
      };
      guardarBorrador(db, id, estado, borrador);
      render(res, estudiante, rol, { id, estado, borrador });
    } catch (error) {
      render(res, estudiante, rol, {
        error: error instanceof Error ? error.message : "No se pudo leer la planilla",
      });
    }
  });

  router.post("/carga/:id/mapeo", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      sinEstudiante(res);
      return;
    }
    const rol = leerCookie(req.headers.cookie, "rol") ?? "estudiante";
    const id = Number(req.params.id);
    const oferta = obtenerOferta(db, id);
    const borrador = leerBorrador(db, id);
    if (!oferta || !borrador) {
      res.redirect("/carga?error=" + encodeURIComponent("La carga ya no existe"));
      return;
    }

    const mapeo = {} as Mapeo;
    for (const campo of CAMPOS) {
      mapeo[campo] = texto((req.body as Record<string, unknown>)[`mapeo_${campo}`]);
    }

    try {
      const parseo = parsearOferta(
        { encabezados: borrador.encabezados, filas: borrador.filasPlanilla },
        mapeo
      );
      let estado = oferta.estado;
      if (estado === "Con inconsistencias") {
        estado = aplicarTransicion(estado, "corregirMapeo");
      }
      estado = aplicarTransicion(estado, "confirmarMapeo");
      const haySecciones = parseo.filas.length > 0;
      const errores = [...parseo.errores];
      if (!haySecciones) {
        errores.push({ numeroFila: 2, motivo: "sin secciones válidas" });
      }
      estado = aplicarTransicion(estado, "validarDatos", errores.length === 0 && haySecciones);

      const actualizado: Borrador = {
        ...borrador,
        periodo: parseo.periodo || borrador.periodo,
        mapeo,
        filas: parseo.filas,
        errores,
      };
      guardarBorrador(db, id, estado, actualizado);
      render(res, estudiante, rol, { id, estado, borrador: actualizado });
    } catch (error) {
      render(res, estudiante, rol, {
        id,
        estado: oferta.estado,
        borrador,
        error: error instanceof Error ? error.message : "No se pudo corregir el mapeo",
      });
    }
  });

  router.post("/carga/:id/excluir", (req, res) => {
    const estudiante = obtenerEstudianteDemo(db);
    if (!estudiante) {
      sinEstudiante(res);
      return;
    }
    const rol = leerCookie(req.headers.cookie, "rol") ?? "estudiante";
    const id = Number(req.params.id);
    const oferta = obtenerOferta(db, id);
    const borrador = leerBorrador(db, id);
    if (!oferta || !borrador) {
      res.redirect("/carga?error=" + encodeURIComponent("La carga ya no existe"));
      return;
    }

    try {
      let estado = aplicarTransicion(oferta.estado, "corregirMapeo");
      estado = aplicarTransicion(estado, "confirmarMapeo");
      estado = aplicarTransicion(estado, "validarDatos", borrador.filas.length > 0);
      const actualizado: Borrador = { ...borrador, errores: [] };
      guardarBorrador(db, id, estado, actualizado);
      render(res, estudiante, rol, {
        id,
        estado,
        borrador: actualizado,
        ok: "Filas inválidas excluidas; se continúa con las filas restantes",
      });
    } catch (error) {
      render(res, estudiante, rol, {
        id,
        estado: oferta.estado,
        borrador,
        error: error instanceof Error ? error.message : "No se pudo confirmar la exclusión",
      });
    }
  });

  router.post("/carga/:id/confirmar", (req, res) => {
    const id = Number(req.params.id);
    if (!obtenerOferta(db, id)) {
      res.redirect("/carga?error=" + encodeURIComponent("La carga ya no existe"));
      return;
    }
    try {
      publicarOferta(db, id);
      res.redirect(
        "/planificador?ok=" +
          encodeURIComponent("Oferta publicada y disponible en el simulador")
      );
    } catch (error) {
      const estudiante = obtenerEstudianteDemo(db);
      if (!estudiante) {
        sinEstudiante(res);
        return;
      }
      render(res, estudiante, leerCookie(req.headers.cookie, "rol") ?? "estudiante", {
        id,
        estado: obtenerOferta(db, id)?.estado ?? "",
        borrador: leerBorrador(db, id),
        error: error instanceof Error ? error.message : "No se pudo publicar la oferta",
      });
    }
  });

  router.post("/carga/:id/cancelar", (req, res) => {
    cancelarCarga(db, Number(req.params.id));
    res.redirect("/carga?ok=" + encodeURIComponent("Carga cancelada; no se publicó la oferta"));
  });

  return router;
}
