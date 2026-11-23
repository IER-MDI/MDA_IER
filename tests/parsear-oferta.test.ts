import { describe, expect, it } from "vitest";
import { leerPlanilla } from "../src/servicios/leerPlanilla";
import { mapeoPorDefecto, parsearOferta } from "../src/servicios/parsearOferta";
import { csvCon, csvEjemplo } from "./ayuda";

describe("HU-01 · Traducción y validación de filas", () => {
  it("interpreta el ejemplo como secciones y reporta la fila sin código", async () => {
    const planilla = await leerPlanilla(csvEjemplo(), ".csv");
    const resultado = parsearOferta(planilla, mapeoPorDefecto(planilla.encabezados));

    expect(resultado.periodo).toBe("2026-3");
    expect(resultado.filas).toHaveLength(2);
    expect(resultado.filas[0]).toMatchObject({
      codigo: "MAT101",
      numero: 1,
      docente: "Prof. Ana Pérez",
      creditos: 5,
      cupos: 30,
      semestreSugerido: 1,
    });
    expect(resultado.filas[0]?.bloques).toHaveLength(2);
    expect(resultado.errores).toEqual([{ numeroFila: 4, motivo: "sin código" }]);
  });

  it("informa los cuatro motivos con número de fila", async () => {
    const cuerpo = [
      "2026-3,MAT101,Cálculo I,1,Prof. Ana Pérez,lunes 08:30-09:50,5,30,1",
      "2026-3,MAT102,Cálculo II,1,Prof. Ana Pérez,,6,30,2",
      "2026-3,MAT101,Cálculo I,1,Prof. Ana Pérez,lunes 10:00-11:20,5,30,1",
      "2026-3,MAT103,Cálculo III,1,Prof. Ana Pérez,lunes 08:30-09:50,0,30,1",
      "2026-3,,Sin código,1,Prof. Ana Pérez,lunes 08:30-09:50,5,30,1",
    ].join("\n");
    const planilla = await leerPlanilla(csvCon(cuerpo), ".csv");
    const resultado = parsearOferta(planilla, mapeoPorDefecto(planilla.encabezados));

    expect(resultado.filas).toHaveLength(1);
    expect(resultado.errores).toEqual([
      { numeroFila: 3, motivo: "sin bloques horarios" },
      { numeroFila: 4, motivo: "sección duplicada" },
      { numeroFila: 5, motivo: "crédito/cupo/semestre inválido" },
      { numeroFila: 6, motivo: "sin código" },
    ]);
  });

  it("permite corregir el mapeo de docente y bloques", async () => {
    const texto = [
      "periodo,codigo,nombre,numero,bloques,docente,creditos,cupos,semestreSugerido",
      "2026-3,MAT101,Cálculo I,1,Prof. Ana Pérez,lunes 08:30-09:50,5,30,1",
      "",
    ].join("\n");
    const planilla = await leerPlanilla(Buffer.from(texto, "utf8"), ".csv");
    const mapeo = mapeoPorDefecto(planilla.encabezados);
    const sinCorregir = parsearOferta(planilla, mapeo);
    expect(sinCorregir.errores[0]?.motivo).toBe("sin bloques horarios");

    const corregido = parsearOferta(planilla, {
      ...mapeo,
      docente: "bloques",
      bloques: "docente",
    });
    expect(corregido.filas).toHaveLength(1);
    expect(corregido.filas[0]?.docente).toBe("Prof. Ana Pérez");
    expect(corregido.filas[0]?.bloques[0]).toEqual({
      dia: "lunes",
      horaInicio: "08:30",
      horaFin: "09:50",
    });
  });

  it("normaliza espacios en el docente", async () => {
    const cuerpo = "2026-3,MAT101,Cálculo I,1,  Prof.   Ana Pérez ,lunes 08:30-09:50,5,30,1";
    const planilla = await leerPlanilla(csvCon(cuerpo), ".csv");
    const resultado = parsearOferta(planilla, mapeoPorDefecto(planilla.encabezados));

    expect(resultado.filas[0]?.docente).toBe("Prof. Ana Pérez");
  });
});
