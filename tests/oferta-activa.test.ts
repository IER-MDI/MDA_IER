import { describe, expect, it } from "vitest";
import {
  calcularCreditos,
  listarSeccionesDeSimulacion,
  listarSeccionesDisponibles,
  ofertaPublicadaActiva,
} from "../src/dominio/repositorios";
import { leerPlanilla } from "../src/servicios/leerPlanilla";
import { mapeoPorDefecto, parsearOferta } from "../src/servicios/parsearOferta";
import {
  crearCarga,
  guardarBorrador,
  publicarOferta,
  type Borrador,
} from "../src/servicios/publicarOferta";
import { agregarSeccion, obtenerSimulacionActivaDelEstudiante } from "../src/servicios/simulacion";
import { baseSembrada, csvEjemplo, idSeccion, idEstudianteDemo } from "./ayuda";

describe("HU-01 · Oferta activa del simulador", () => {
  it("mantiene 2026-2 como activa y cambia a 2026-3 al publicar", async () => {
    const db = baseSembrada();
    expect(ofertaPublicadaActiva(db)?.periodo).toBe("2026-2");

    const simulacion = obtenerSimulacionActivaDelEstudiante(db, idEstudianteDemo(db));
    expect(agregarSeccion(db, simulacion.id, idSeccion(db, "MAT101")).tipo).toBe("ok");
    expect(calcularCreditos(db, simulacion.id)).toBe(5);

    const planilla = await leerPlanilla(csvEjemplo(), ".csv");
    const parseo = parsearOferta(planilla, mapeoPorDefecto(planilla.encabezados));
    const id = crearCarga(db, "2026-3");
    const borrador: Borrador = {
      periodo: parseo.periodo,
      encabezados: parseo.encabezados,
      filasPlanilla: planilla.filas,
      mapeo: parseo.mapeo,
      filas: parseo.filas,
      errores: parseo.errores,
    };
    guardarBorrador(db, id, "Estructurada", borrador);
    publicarOferta(db, id);

    expect(ofertaPublicadaActiva(db)?.periodo).toBe("2026-3");
    expect(listarSeccionesDeSimulacion(db, simulacion.id)).toHaveLength(0);
    expect(calcularCreditos(db, simulacion.id)).toBe(0);

    const codigos = listarSeccionesDisponibles(db, simulacion.id).map(
      (seccion) => seccion.asignatura.codigo
    );
    expect(codigos).toContain("NUEV101");
    expect(codigos).not.toContain("FIS101");
    db.close();
  });
});
