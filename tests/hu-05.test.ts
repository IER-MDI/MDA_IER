import { describe, expect, it } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { sembrar } from "../src/db/seed";
import {
  listarAsignaturasDeMalla,
  listarCodigosAprobados,
  obtenerCarreraDelEstudiante,
} from "../src/dominio/repositorios";
import { calcularTiempoRestante } from "../src/dominio/tiempo-restante";
import { baseSembrada, idAsignatura, idEstudianteDemo } from "./ayuda";

describe("HU-05 · Estimación del tiempo restante de titulación", () => {
  it("2.2 carga la malla y el avance de ejemplo sin duplicarlos", () => {
    const db = baseSembrada();
    const estudianteId = idEstudianteDemo(db);
    const carrera = obtenerCarreraDelEstudiante(db, estudianteId);

    expect(carrera?.nombre).toBe("Ingeniería Civil Informática");
    expect(listarAsignaturasDeMalla(db, carrera!.id)).toHaveLength(12);
    expect(listarCodigosAprobados(db, estudianteId)).toEqual(["FIS101", "MAT101", "MAT201", "PROG101"]);

    sembrar(db);
    const registros = db.prepare("SELECT COUNT(*) AS total FROM asignatura_cursada").get() as {
      total: number;
    };
    expect(registros.total).toBe(4);
    db.close();
  });

  it("Escenario · El sistema estima el mínimo de semestres restantes a partir del avance", () => {
    const db = baseSembrada();
    const resultado = calcularTiempoRestante(db, idEstudianteDemo(db));

    expect(resultado.minimoSemestres).toBe(4);
    expect(resultado.cadenaCritica).toContain(idAsignatura(db, "MAT202"));
    expect(resultado.pendientes.find((asignatura) => asignatura.codigo === "MAT102")?.critica).toBe(true);
    expect(resultado.pendientes.find((asignatura) => asignatura.codigo === "BD101")?.critica).toBe(false);
    expect(resultado.simulacion).toBeNull();
    db.close();
  });

  it("Escenario · Simular la reprobación de una asignatura crítica aumenta el tiempo restante", () => {
    const db = baseSembrada();
    const resultado = calcularTiempoRestante(db, idEstudianteDemo(db), {
      asignaturaId: idAsignatura(db, "MAT202"),
      accion: "reprobar",
    });

    expect(resultado.simulacion).toEqual({
      codigo: "MAT202",
      nombre: "Ecuaciones Diferenciales",
      accion: "reprobar",
      esCritica: true,
      minimoSemestres: 5,
      retraso: 1,
    });
    expect(resultado.minimoSemestres).toBe(4);
    db.close();
  });

  it("2.4 simular una asignatura no crítica mantiene el mínimo y retraso 0", () => {
    const db = baseSembrada();
    const resultado = calcularTiempoRestante(db, idEstudianteDemo(db), {
      asignaturaId: idAsignatura(db, "BD101"),
      accion: "postergar",
    });

    expect(resultado.simulacion?.esCritica).toBe(false);
    expect(resultado.simulacion?.retraso).toBe(0);
    expect(resultado.simulacion?.minimoSemestres).toBe(4);

    expect(() =>
      calcularTiempoRestante(db, idEstudianteDemo(db), {
        asignaturaId: idAsignatura(db, "MAT101"),
        accion: "reprobar",
      })
    ).toThrow(/no es una asignatura pendiente/);
    db.close();
  });

  it("4.3 muestra el mínimo y el retraso en la pantalla y valida la simulación", async () => {
    const db = baseSembrada();
    const app = crearApp(db);

    const base = await request(app).get("/tiempo-restante");
    expect(base.status).toBe(200);
    expect(base.text).toContain("Mínimo estimado: 4 semestres");
    expect(base.text).toContain("MAT202");
    expect(base.text).toContain("Tiempo restante para titularse");

    const envio = await request(app)
      .post("/tiempo-restante/simular")
      .type("form")
      .send({ asignatura_id: idAsignatura(db, "MAT202"), accion: "reprobar" });
    expect(envio.status).toBe(302);
    const ubicacion = envio.headers.location ?? "";

    const simulada = await request(app).get(ubicacion);
    expect(simulada.status).toBe(200);
    expect(simulada.text).toContain("Mínimo estimado: 5 semestres");
    expect(simulada.text).toContain("Retraso: 1 semestre");

    const invalida = await request(app)
      .post("/tiempo-restante/simular")
      .type("form")
      .send({ asignatura_id: idAsignatura(db, "MAT202"), accion: "olvida" });
    expect(invalida.headers.location).toContain("error=");
    db.close();
  });
});
