import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  listarAvance,
  listarMalla,
  listarPrerrequisitos,
  listarSeccionesDeSimulacion,
  listarSeccionesDisponibles,
  ofertaPublicadaActiva,
  obtenerCarreraDelEstudiante,
} from "../src/dominio/repositorios";
import { calcularTiempoRestante } from "../src/dominio/tiempo-restante";
import { agregarSeccion, obtenerSimulacionActivaDelEstudiante } from "../src/servicios/simulacion";
import { cargarYPublicarEjemplo } from "./ayuda-hu-01";
import { baseSembrada, idEstudianteDemo, idSeccion } from "./ayuda";

function filaPorCodigo(html: string, codigo: string): string {
  const patron = new RegExp(`<tr>[\\s\\S]*?${codigo}[\\s\\S]*?</tr>`);
  return html.match(patron)?.[0] ?? "";
}

describe("HU-01 · Integración con HU-02, HU-03, HU-04 y HU-05", () => {
  it("publica la oferta y mantiene métricas, malla y avance coherentes", async () => {
    const db = baseSembrada();
    const estudianteId = idEstudianteDemo(db);
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, estudianteId);
    expect(agregarSeccion(db, simulacion.id, idSeccion(db, "MAT101")).tipo).toBe("ok");

    const { app } = await cargarYPublicarEjemplo(db);

    expect(ofertaPublicadaActiva(db)?.periodo).toBe("2026-3");
    expect(listarSeccionesDeSimulacion(db, simulacion.id)).toHaveLength(0);
    const disponibles = listarSeccionesDisponibles(db, simulacion.id).map(
      (seccion) => seccion.asignatura.codigo
    );
    expect(disponibles).toContain("NUEV101");
    expect(disponibles).not.toContain("FIS101");

    const pagina = await request(app).get("/planificador");
    expect(pagina.status).toBe(200);
    expect(pagina.text).toContain("4,0 de 5");
    expect(pagina.text).toContain("4,3 de 5");
    expect(filaPorCodigo(pagina.text, "NUEV101")).toContain("Sin evaluaciones");

    const carrera = obtenerCarreraDelEstudiante(db, estudianteId);
    expect(listarMalla(db, carrera!.id)).toHaveLength(13);
    expect(
      [...listarPrerrequisitos(db).values()].reduce((total, previos) => total + previos.length, 0)
    ).toBe(7);
    expect(listarAvance(db, estudianteId).size).toBe(5);
    expect(listarMalla(db, carrera!.id).some((asignatura) => asignatura.codigo === "NUEV101")).toBe(
      false
    );
    expect(calcularTiempoRestante(db, estudianteId).minimoSemestres).toBe(4);
    db.close();
  });

  it("muestra el enlace de carga y el rol de administrador comunitario", async () => {
    const db = baseSembrada();
    const { app } = await cargarYPublicarEjemplo(db);
    const agente = request.agent(app);

    await agente.post("/rol").type("form").send({ rol: "administrador" });
    const planificador = await agente.get("/planificador");

    expect(planificador.text).toContain('href="/carga"');
    expect(planificador.text).toContain('<span class="rol">Administrador comunitario</span>');
    expect((await agente.get("/carga")).status).toBe(200);
    db.close();
  });
});
