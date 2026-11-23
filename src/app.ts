import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BaseDatos } from "./db/conexion";
import { crearRutasCarga } from "./rutas/carga";
import { crearRutasMalla } from "./rutas/malla";
import { crearRutasPlanificador } from "./rutas/planificador";
import { crearRutasTiempoRestante } from "./rutas/tiempo-restante";

const aqui = path.dirname(fileURLToPath(import.meta.url));

export function crearApp(db: BaseDatos): Express {
  const app = express();
  app.set("views", path.join(aqui, "vistas"));
  app.set("view engine", "ejs");
  app.use(express.urlencoded({ extended: false }));

  app.get("/salud", (_req, res) => {
    res.type("text/plain").send("ok");
  });

  app.use(crearRutasCarga(db));
  app.use(crearRutasPlanificador(db));
  app.use(crearRutasMalla(db));
  app.use(crearRutasTiempoRestante(db));

  return app;
}
