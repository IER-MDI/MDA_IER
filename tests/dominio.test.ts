import { describe, expect, it } from "vitest";
import { buscarChoque, seSolapan } from "../src/dominio/horario";
import { listarSecciones } from "../src/dominio/repositorios";
import { baseSembrada } from "./ayuda";

const bloque = (dia: string, horaInicio: string, horaFin: string) => ({
  id: 0,
  dia,
  horaInicio,
  horaFin,
});

describe("Solapamiento de bloques horarios", () => {
  it("dos bloques que se tocan en el límite no se solapan", () => {
    expect(seSolapan(bloque("lunes", "08:30", "09:50"), bloque("lunes", "09:50", "10:20"))).toBe(false);
  });

  it("dos bloques que comparten un intervalo se solapan", () => {
    expect(seSolapan(bloque("lunes", "08:30", "09:50"), bloque("lunes", "09:00", "10:20"))).toBe(true);
  });

  it("dos bloques del mismo día sin cruce no se solapan", () => {
    expect(seSolapan(bloque("lunes", "08:30", "09:50"), bloque("lunes", "10:00", "11:20"))).toBe(false);
  });

  it("dos bloques en días distintos no se solapan", () => {
    expect(seSolapan(bloque("lunes", "08:30", "09:50"), bloque("martes", "08:30", "09:50"))).toBe(false);
  });

  it("buscarChoque informa la sección con la que choca", () => {
    const db = baseSembrada();
    const secciones = listarSecciones(db);
    const calculoI = secciones.find((seccion) => seccion.asignatura.codigo === "MAT101");
    const fisicaI = secciones.find((seccion) => seccion.asignatura.codigo === "FIS101");
    expect(calculoI).toBeDefined();
    expect(fisicaI).toBeDefined();
    if (!calculoI || !fisicaI) {
      return;
    }
    const choque = buscarChoque(fisicaI.bloques, [calculoI]);
    expect(choque?.seccion.asignatura.codigo).toBe("MAT101");
    db.close();
  });
});

describe("Repositorio de oferta académica", () => {
  it("devuelve las 8 secciones sembradas con sus bloques", () => {
    const db = baseSembrada();
    const secciones = listarSecciones(db);

    expect(secciones).toHaveLength(8);
    expect(secciones.every((seccion) => seccion.bloques.length > 0)).toBe(true);

    const calculoI = secciones.find((seccion) => seccion.asignatura.codigo === "MAT101");
    expect(calculoI?.asignatura.creditos).toBe(5);
    expect(calculoI?.bloques).toHaveLength(2);
    expect(secciones.flatMap((seccion) => seccion.bloques)).toHaveLength(15);
    db.close();
  });
});
