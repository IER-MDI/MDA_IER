import request from "supertest";
import { describe, expect, it } from "vitest";
import { crearApp } from "../src/app";
import { CAMPOS } from "../src/servicios/parsearOferta";
import { cargarYPublicarEjemplo } from "./ayuda-hu-01";
import {
  baseSembrada,
  csvCon,
  csvEjemplo,
  estadoOferta,
  idOferta,
} from "./ayuda";
import type { Borrador } from "../src/servicios/publicarOferta";

function leerBorrador(db: ReturnType<typeof baseSembrada>, id: number): Borrador {
  const fila = db.prepare("SELECT borrador FROM oferta_academica WHERE id = ?").get(id) as {
    borrador: string;
  };
  return JSON.parse(fila.borrador) as Borrador;
}

function cuerpoMapeo(borrador: Borrador, cambios: Partial<Borrador["mapeo"]> = {}) {
  return Object.fromEntries(
    CAMPOS.map((campo) => [
      `mapeo_${campo}`,
      cambios[campo] ?? borrador.mapeo[campo],
    ])
  );
}

describe("HU-01 · Carga y traducción de oferta académica", () => {
  it("Escenario · Una planilla válida se incorpora al sistema", async () => {
    const db = baseSembrada();
    const app = crearApp(db);
    const respuesta = await request(app)
      .post("/carga/archivo")
      .attach("archivo", csvEjemplo(), { filename: "ejemplo.csv", contentType: "text/csv" });

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain('name="mapeo_codigo"');
    expect(respuesta.text).toContain("MAT101 — Cálculo I");
    expect(respuesta.text).toContain("NUEV101 — Taller de Innovación");
    const id = idOferta(db, "2026-3");
    expect(estadoOferta(db, id)).toBe("Mapeo en revisión");
    expect(leerBorrador(db, id).filas).toHaveLength(2);
    db.close();
  });

  it("Escenario · Una planilla con filas que no se pueden interpretar", async () => {
    const db = baseSembrada();
    const app = crearApp(db);
    await request(app)
      .post("/carga/archivo")
      .attach("archivo", csvEjemplo(), { filename: "ejemplo.csv", contentType: "text/csv" });
    const id = idOferta(db, "2026-3");
    const mapeo = await request(app)
      .post(`/carga/${id}/mapeo`)
      .type("form")
      .send(cuerpoMapeo(leerBorrador(db, id)));

    expect(mapeo.status).toBe(200);
    expect(mapeo.text).toContain("Fila 4 — sin código");
    expect(estadoOferta(db, id)).toBe("Con inconsistencias");

    const exclusion = await request(app).post(`/carga/${id}/excluir`);
    expect(exclusion.status).toBe(200);
    expect(estadoOferta(db, id)).toBe("Estructurada");
    expect(leerBorrador(db, id).errores).toHaveLength(0);
    db.close();
  });

  it("Escenario · Un archivo con formato no admitido es rechazado", async () => {
    const db = baseSembrada();
    const app = crearApp(db);
    const respuesta = await request(app)
      .post("/carga/archivo")
      .attach("archivo", Buffer.from("no soy excel"), {
        filename: "oferta.pdf",
        contentType: "application/pdf",
      });

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain("Formato no admitido: use .xlsx o .csv");
    expect(db.prepare("SELECT id FROM oferta_academica WHERE periodo = '2026-3'").get()).toBeUndefined();
    db.close();
  });

  it("Escenario · La corrección del mapeo permite incorporar filas antes excluidas", async () => {
    const db = baseSembrada();
    const app = crearApp(db);
    const texto = [
      "periodo,codigo,nombre,numero,bloques,docente,creditos,cupos,semestreSugerido",
      "2026-5,MAT101,Cálculo I,1,Prof. Ana Pérez,lunes 08:30-09:50,5,30,1",
      "",
    ].join("\n");
    await request(app)
      .post("/carga/archivo")
      .attach("archivo", Buffer.from(texto, "utf8"), {
        filename: "swap.csv",
        contentType: "text/csv",
      });
    const id = idOferta(db, "2026-5");

    const sinCorregir = await request(app)
      .post(`/carga/${id}/mapeo`)
      .type("form")
      .send(cuerpoMapeo(leerBorrador(db, id)));
    expect(sinCorregir.text).toContain("sin bloques horarios");

    const corregida = await request(app)
      .post(`/carga/${id}/mapeo`)
      .type("form")
      .send(cuerpoMapeo(leerBorrador(db, id), { docente: "bloques", bloques: "docente" }));
    expect(corregida.status).toBe(200);
    expect(estadoOferta(db, id)).toBe("Estructurada");
    const borrador = leerBorrador(db, id);
    expect(borrador.filas).toHaveLength(1);
    expect(borrador.filas[0]?.docente).toBe("Prof. Ana Pérez");
    db.close();
  });

  it("Escenario · La confirmación publica la oferta y la deja disponible en el simulador", async () => {
    const db = baseSembrada();
    const { app, id } = await cargarYPublicarEjemplo(db);

    expect(estadoOferta(db, id)).toBe("Publicada");
    const secciones = db
      .prepare("SELECT COUNT(*) AS total FROM seccion WHERE oferta_id = ?")
      .get(id) as { total: number };
    expect(secciones.total).toBe(2);
    const planificador = await request(app).get("/planificador");
    expect(planificador.text).toContain("NUEV101 — Taller de Innovación");
    db.close();
  });

  it("Escenario · La cancelación o los errores pendientes impiden publicar la oferta", async () => {
    const db = baseSembrada();
    const app = crearApp(db);
    await request(app)
      .post("/carga/archivo")
      .attach("archivo", csvEjemplo(), { filename: "ejemplo.csv", contentType: "text/csv" });
    const id = idOferta(db, "2026-3");

    await request(app).post(`/carga/${id}/cancelar`);

    expect(db.prepare("SELECT id FROM oferta_academica WHERE periodo = '2026-3'").get()).toBeUndefined();
    db.close();
  });

  it("Variante · El período de la planilla ya está publicado", async () => {
    const db = baseSembrada();
    const { app } = await cargarYPublicarEjemplo(db);

    const segunda = await request(app)
      .post("/carga/archivo")
      .attach("archivo", csvEjemplo(), { filename: "ejemplo.csv", contentType: "text/csv" });

    expect(segunda.status).toBe(200);
    expect(segunda.text).toContain("La oferta 2026-3 ya está publicada");
    const ofertas = db
      .prepare("SELECT COUNT(*) AS total FROM oferta_academica WHERE periodo = '2026-3'")
      .get() as { total: number };
    expect(ofertas.total).toBe(1);
    db.close();
  });

  it("Variante · Ninguna fila válida impide publicar la oferta", async () => {
    const db = baseSembrada();
    const app = crearApp(db);
    await request(app)
      .post("/carga/archivo")
      .attach(
        "archivo",
        csvCon("2026-7,,Sin código,1,Prof. X,lunes 08:30-09:50,5,30,1"),
        { filename: "invalida.csv", contentType: "text/csv" }
      );
    const id = idOferta(db, "2026-7");

    const mapeo = await request(app)
      .post(`/carga/${id}/mapeo`)
      .type("form")
      .send(cuerpoMapeo(leerBorrador(db, id)));

    expect(mapeo.text).toContain("sin secciones válidas");
    expect(estadoOferta(db, id)).toBe("Con inconsistencias");
    expect(db.prepare("SELECT estado FROM oferta_academica WHERE id = ?").get(id)).toMatchObject({
      estado: "Con inconsistencias",
    });
    db.close();
  });
});
