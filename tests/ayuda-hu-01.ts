import request from "supertest";
import { crearApp } from "../src/app";
import type { BaseDatos } from "../src/db/conexion";
import { CAMPOS } from "../src/servicios/parsearOferta";
import type { Borrador } from "../src/servicios/publicarOferta";
import { csvEjemplo, idOferta } from "./ayuda";

/** Recorre la interfaz de HU-01 con la planilla de ejemplo y publica 2026-3. */
export async function cargarYPublicarEjemplo(db: BaseDatos) {
  const app = crearApp(db);

  const carga = await request(app)
    .post("/carga/archivo")
    .attach("archivo", csvEjemplo(), { filename: "ejemplo.csv", contentType: "text/csv" });
  if (carga.status !== 200) {
    throw new Error(`No se pudo cargar la planilla: ${carga.status}`);
  }

  const id = idOferta(db, "2026-3");
  const fila = db.prepare("SELECT borrador FROM oferta_academica WHERE id = ?").get(id) as {
    borrador: string;
  };
  const borrador = JSON.parse(fila.borrador) as Borrador;
  const cuerpo = Object.fromEntries(CAMPOS.map((campo) => [`mapeo_${campo}`, borrador.mapeo[campo]]));

  const mapeo = await request(app).post(`/carga/${id}/mapeo`).type("form").send(cuerpo);
  if (mapeo.status !== 200) {
    throw new Error(`No se pudo aplicar el mapeo: ${mapeo.status}`);
  }

  const exclusion = await request(app).post(`/carga/${id}/excluir`);
  if (exclusion.status !== 200) {
    throw new Error(`No se pudo confirmar la exclusión: ${exclusion.status}`);
  }

  const publicacion = await request(app).post(`/carga/${id}/confirmar`);
  if (publicacion.status !== 302) {
    throw new Error(`No se pudo publicar: ${publicacion.status}`);
  }

  return { app, id };
}
