import { describe, expect, it } from "vitest";
import { leerPlanilla } from "../src/servicios/leerPlanilla";
import { mapeoPorDefecto, parsearOferta } from "../src/servicios/parsearOferta";
import {
  crearCarga,
  guardarBorrador,
  publicarOferta,
  type Borrador,
} from "../src/servicios/publicarOferta";
import { baseSembrada, csvCon, idAsignatura } from "./ayuda";

async function borradorDesde(cuerpo: string): Promise<Borrador> {
  const planilla = await leerPlanilla(csvCon(cuerpo), ".csv");
  const parseo = parsearOferta(planilla, mapeoPorDefecto(planilla.encabezados));
  return {
    periodo: parseo.periodo,
    encabezados: parseo.encabezados,
    filasPlanilla: planilla.filas,
    mapeo: parseo.mapeo,
    filas: parseo.filas,
    errores: parseo.errores,
  };
}

describe("HU-01 · Publicación de la oferta", () => {
  it("reutiliza MAT101 conservando su id y guarda secciones y bloques", async () => {
    const db = baseSembrada();
    const idAntes = idAsignatura(db, "MAT101");
    const borrador = await borradorDesde(
      [
        "2026-3,MAT101,Cálculo I,1,Prof. Ana Pérez,lunes 08:30-09:50; miercoles 08:30-09:50,7,30,1",
        "2026-3,NUEV101,Taller de Innovación,1,Prof. Nueva Docente,martes 10:00-11:20,4,20,3",
      ].join("\n")
    );

    const id = crearCarga(db, "2026-3");
    guardarBorrador(db, id, "Estructurada", borrador);
    publicarOferta(db, id);

    expect(idAsignatura(db, "MAT101")).toBe(idAntes);
    const mat101 = db
      .prepare("SELECT creditos FROM asignatura WHERE id = ?")
      .get(idAntes) as { creditos: number };
    expect(mat101.creditos).toBe(7);
    expect(db.prepare("SELECT id FROM asignatura WHERE codigo = 'NUEV101'").get()).toBeDefined();

    const secciones = db
      .prepare("SELECT COUNT(*) AS total FROM seccion WHERE oferta_id = ?")
      .get(id) as { total: number };
    const bloques = db
      .prepare(
        "SELECT COUNT(*) AS total FROM bloque_horario b JOIN seccion s ON s.id = b.seccion_id WHERE s.oferta_id = ?"
      )
      .get(id) as { total: number };
    expect(secciones.total).toBe(2);
    expect(bloques.total).toBe(3);
    db.close();
  });

  it("rechaza un período ya publicado", () => {
    const db = baseSembrada();
    expect(() => crearCarga(db, "2026-2")).toThrow(/ya está publicada/);
    db.close();
  });

  it("no publica sin secciones válidas", () => {
    const db = baseSembrada();
    const id = crearCarga(db, "2026-4");
    const borrador: Borrador = {
      periodo: "2026-4",
      encabezados: [],
      filasPlanilla: [],
      mapeo: {
        periodo: "",
        codigo: "",
        nombre: "",
        numero: "",
        docente: "",
        bloques: "",
        creditos: "",
        cupos: "",
        semestreSugerido: "",
      },
      filas: [],
      errores: [],
    };
    guardarBorrador(db, id, "Estructurada", borrador);
    expect(() => publicarOferta(db, id)).toThrow(/Sin secciones válidas/);
    db.close();
  });
});
