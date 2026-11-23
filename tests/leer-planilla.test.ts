import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { leerPlanilla } from "../src/servicios/leerPlanilla";
import { csvEjemplo } from "./ayuda";

describe("HU-01 · Lectura de planillas", () => {
  it("lee el CSV de ejemplo con encabezados y número de fila", async () => {
    const planilla = await leerPlanilla(csvEjemplo(), ".csv");

    expect(planilla.encabezados).toEqual([
      "periodo",
      "codigo",
      "nombre",
      "numero",
      "docente",
      "bloques",
      "creditos",
      "cupos",
      "semestreSugerido",
    ]);
    expect(planilla.filas).toHaveLength(3);
    expect(planilla.filas[0]?.numero).toBe(2);
    expect(planilla.filas[0]?.celdas.codigo).toBe("MAT101");
    expect(planilla.filas[2]?.celdas.codigo).toBe("");
  });

  it("lee un .xlsx generado en la prueba usando la primera hoja", async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Oferta");
    hoja.addRow(["periodo", "codigo", "nombre", "numero", "docente", "bloques", "creditos", "cupos", "semestreSugerido"]);
    hoja.addRow([
      "2026-3",
      "MAT101",
      "Cálculo I",
      1,
      "Prof. Ana Pérez",
      "lunes 08:30-09:50",
      5,
      30,
      1,
    ]);
    const contenido = await libro.xlsx.writeBuffer();

    const planilla = await leerPlanilla(Buffer.from(contenido), ".xlsx");

    expect(planilla.filas).toHaveLength(1);
    expect(planilla.filas[0]?.celdas.codigo).toBe("MAT101");
    expect(planilla.filas[0]?.celdas.bloques).toBe("lunes 08:30-09:50");
  });

  it("rechaza una extensión distinta de .xlsx o .csv", async () => {
    await expect(leerPlanilla(Buffer.from("x"), ".pdf")).rejects.toThrow(
      "Formato no admitido: use .xlsx o .csv"
    );
  });
});
