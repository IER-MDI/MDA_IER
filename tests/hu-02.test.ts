import { describe, expect, it } from "vitest";
import {
  agregarSeccion,
  calcularCreditos,
  listarSeccionesIncluidas,
  obtenerSimulacionActivaDelEstudiante,
  removerSeccion,
} from "../src/servicios/simulacion";
import { baseSembrada, idEstudianteDemo, idSeccion } from "./ayuda";

describe("HU-02 · Simulación de horario", () => {
  it("4.1 una simulación vacía tiene 0 créditos", () => {
    const db = baseSembrada();
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, idEstudianteDemo(db));
    expect(simulacion.nombre).toBe("Mi horario");
    expect(simulacion.estado).toBe("en armado");
    expect(calcularCreditos(db, simulacion.id)).toBe(0);
    db.close();
  });

  it("Escenario · Agregar una sección a la simulación actualiza la carga de créditos", () => {
    const db = baseSembrada();
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, idEstudianteDemo(db));

    const primero = agregarSeccion(db, simulacion.id, idSeccion(db, "MAT101"));
    const segundo = agregarSeccion(db, simulacion.id, idSeccion(db, "MAT102"));

    expect(primero).toMatchObject({ tipo: "ok", totalCreditos: 5 });
    expect(segundo).toMatchObject({ tipo: "ok", totalCreditos: 11 });
    expect(calcularCreditos(db, simulacion.id)).toBe(11);
    expect(listarSeccionesIncluidas(db, simulacion.id)).toHaveLength(2);
    db.close();
  });

  it("Escenario · Una sección que choca en horario con la simulación es advertida", () => {
    const db = baseSembrada();
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, idEstudianteDemo(db));
    agregarSeccion(db, simulacion.id, idSeccion(db, "MAT101"));

    const resultado = agregarSeccion(db, simulacion.id, idSeccion(db, "FIS101"));

    expect(resultado.tipo).toBe("choque");
    if (resultado.tipo === "choque") {
      expect(resultado.seccionEnConflicto.asignatura.codigo).toBe("MAT101");
    }
    expect(calcularCreditos(db, simulacion.id)).toBe(5);
    expect(listarSeccionesIncluidas(db, simulacion.id)).toHaveLength(1);
    db.close();
  });

  it("Escenario · Una sección que supera el tope de créditos es advertida", () => {
    const db = baseSembrada();
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, idEstudianteDemo(db));
    for (const codigo of ["MAT101", "PROG101", "BD101", "ING101", "ECO101"]) {
      const resultado = agregarSeccion(db, simulacion.id, idSeccion(db, codigo));
      expect(resultado.tipo).toBe("ok");
    }
    expect(calcularCreditos(db, simulacion.id)).toBe(28);

    const resultado = agregarSeccion(db, simulacion.id, idSeccion(db, "HUM101"));

    expect(resultado).toEqual({ tipo: "tope", totalCreditos: 33, tope: 30 });
    expect(calcularCreditos(db, simulacion.id)).toBe(28);
    expect(listarSeccionesIncluidas(db, simulacion.id)).toHaveLength(5);
    db.close();
  });

  it("Escenario · Remover una sección recalcula la carga de créditos", () => {
    const db = baseSembrada();
    const simulacion = obtenerSimulacionActivaDelEstudiante(db, idEstudianteDemo(db));
    const mat101 = idSeccion(db, "MAT101");
    const mat102 = idSeccion(db, "MAT102");
    agregarSeccion(db, simulacion.id, mat101);
    agregarSeccion(db, simulacion.id, mat102);
    expect(calcularCreditos(db, simulacion.id)).toBe(11);

    removerSeccion(db, simulacion.id, mat102);

    expect(calcularCreditos(db, simulacion.id)).toBe(5);
    const incluidas = listarSeccionesIncluidas(db, simulacion.id);
    expect(incluidas).toHaveLength(1);
    expect(incluidas[0]?.asignatura.codigo).toBe("MAT101");
    db.close();
  });
});
