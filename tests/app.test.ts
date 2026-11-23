import { describe, expect, it } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { baseSembrada, idSeccion } from "./ayuda";

function appDePrueba() {
  const db = baseSembrada();
  return { db, app: crearApp(db) };
}

describe("HU-02 · Planificador de horario (HTTP)", () => {
  it("5.1 GET /planificador responde 200 y muestra la simulación vacía", async () => {
    const { db, app } = appDePrueba();

    const respuesta = await request(app).get("/planificador");

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain("Mi horario");
    expect(respuesta.text).toContain("0 de 30 créditos");
    expect(respuesta.text).toContain("Secciones de la oferta académica");
    db.close();
  });

  it("5.2 un alta válida redirige y aparece en la grilla", async () => {
    const { db, app } = appDePrueba();

    const alta = await request(app)
      .post("/planificador/secciones")
      .type("form")
      .send({ seccion_id: idSeccion(db, "MAT101") });

    expect(alta.status).toBe(302);
    expect(alta.headers.location).toContain("ok=");

    const pagina = await request(app).get(alta.headers.location ?? "/planificador");
    expect(pagina.text).toContain("La sección se agregó a tu horario");
    expect(pagina.text).toContain("5 de 30 créditos");
    db.close();
  });

  it("5.2 un choque de horario muestra el mensaje y no cambia el total", async () => {
    const { db, app } = appDePrueba();
    await request(app)
      .post("/planificador/secciones")
      .type("form")
      .send({ seccion_id: idSeccion(db, "MAT101") });

    const alta = await request(app)
      .post("/planificador/secciones")
      .type("form")
      .send({ seccion_id: idSeccion(db, "FIS101") });

    expect(alta.status).toBe(302);
    expect(decodeURIComponent(alta.headers.location ?? "")).toContain(
      "Choque de horario con Cálculo I sección 1"
    );

    const pagina = await request(app).get(alta.headers.location ?? "/planificador");
    expect(pagina.text).toContain("Choque de horario con Cálculo I sección 1");
    expect(pagina.text).toContain("5 de 30 créditos");
    db.close();
  });

  it("5.2 un exceso de tope muestra el mensaje y mantiene los 28 créditos", async () => {
    const { db, app } = appDePrueba();
    for (const codigo of ["MAT101", "PROG101", "BD101", "ING101", "ECO101"]) {
      await request(app)
        .post("/planificador/secciones")
        .type("form")
        .send({ seccion_id: idSeccion(db, codigo) });
    }

    const alta = await request(app)
      .post("/planificador/secciones")
      .type("form")
      .send({ seccion_id: idSeccion(db, "HUM101") });

    expect(alta.status).toBe(302);
    expect(decodeURIComponent(alta.headers.location ?? "")).toContain(
      "Se superaría el tope de créditos: 33 de 30"
    );

    const pagina = await request(app).get(alta.headers.location ?? "/planificador");
    expect(pagina.text).toContain("Se superaría el tope de créditos: 33 de 30");
    expect(pagina.text).toContain("28 de 30 créditos");
    db.close();
  });

  it("5.2 quitar una sección recalcula el total", async () => {
    const { db, app } = appDePrueba();
    const mat101 = idSeccion(db, "MAT101");
    await request(app).post("/planificador/secciones").type("form").send({ seccion_id: mat101 });

    const baja = await request(app).post(`/planificador/secciones/${mat101}/eliminar`);

    expect(baja.status).toBe(302);
    expect(decodeURIComponent(baja.headers.location ?? "")).toContain("La sección se quitó de tu horario");
    const pagina = await request(app).get(baja.headers.location ?? "/planificador");
    expect(pagina.text).toContain("0 de 30 créditos");
    db.close();
  });

  it("HU02-E04 · Una sección de la simulación deja de ofrecerse y vuelve al removerla", async () => {
    const { db, app } = appDePrueba();
    const mat101 = idSeccion(db, "MAT101");

    const antes = await request(app).get("/planificador");
    expect(antes.text.match(/>Agregar</g) ?? []).toHaveLength(8);

    await request(app).post("/planificador/secciones").type("form").send({ seccion_id: mat101 });
    const despues = await request(app).get("/planificador");
    expect(despues.text.match(/>Agregar</g) ?? []).toHaveLength(7);
    expect(despues.text).toContain("MAT101");
    expect(despues.text).toContain("5 de 30 créditos");

    const baja = await request(app).post(`/planificador/secciones/${mat101}/eliminar`);
    expect(baja.status).toBe(302);
    const final = await request(app).get(baja.headers.location ?? "/planificador");
    expect(final.text.match(/>Agregar</g) ?? []).toHaveLength(8);
    expect(final.text).toContain("MAT101");
    expect(final.text).toContain("0 de 30 créditos");
    db.close();
  });

  it("5.3 GET / redirige al planificador y el rol se muestra en la cabecera", async () => {
    const { db, app } = appDePrueba();

    const raiz = await request(app).get("/");
    expect(raiz.status).toBe(302);
    expect(raiz.headers.location).toBe("/planificador");

    const agente = request.agent(app);
    const cambio = await agente.post("/rol").type("form").send({ rol: "estudiante" });
    expect(cambio.status).toBe(302);

    const pagina = await agente.get("/planificador");
    expect(pagina.text).toContain('<span class="rol">Estudiante</span>');
    db.close();
  });
});
