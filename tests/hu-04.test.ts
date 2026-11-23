import { describe, expect, it } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { sembrar } from "../src/db/seed";
import { calcularCadena, calcularEstado } from "../src/dominio/malla";
import { listarAvance, listarMalla, listarPrerrequisitos } from "../src/dominio/repositorios";
import { baseSembrada, idAsignatura, idEstudianteDemo } from "./ayuda";

function tarjeta(html: string, codigo: string): string {
  const patron = new RegExp(`<article[^>]*data-codigo="${codigo}"[^>]*>[\\s\\S]*?</article>`);
  return html.match(patron)?.[0] ?? "";
}

describe("HU-04 · Malla interactiva y cadena de prerrequisitos", () => {
  it("1.2–1.5 siembra la malla, los prerrequisitos y el avance de forma idempotente", () => {
    const db = baseSembrada();

    const contar = (tabla: string): number =>
      (db.prepare(`SELECT COUNT(*) AS total FROM ${tabla}`).get() as { total: number }).total;

    expect(contar("carrera_asignatura")).toBe(13);
    expect(contar("asignatura_prerrequisito")).toBe(7);
    expect(contar("asignatura_cursada")).toBe(5);

    const ecu301 = idAsignatura(db, "ECU301");
    const seccionesEcu301 = db
      .prepare("SELECT COUNT(*) AS total FROM seccion WHERE asignatura_id = ?")
      .get(ecu301) as { total: number };
    expect(seccionesEcu301.total).toBe(0);

    sembrar(db);
    expect(contar("carrera_asignatura")).toBe(13);
    expect(contar("asignatura_prerrequisito")).toBe(7);
    expect(contar("asignatura_cursada")).toBe(5);

    db.close();
  });

  it("2.2–2.3 calcula el estado y la red transitiva", () => {
    const prerrequisitos = new Map<number, number[]>([
      [2, [1]],
      [3, [2]],
      [4, [1]],
    ]);

    const aprobadas = new Set([1]);
    expect(calcularEstado(1, aprobadas, prerrequisitos)).toBe("aprobada");
    expect(calcularEstado(2, aprobadas, prerrequisitos)).toBe("disponible");
    expect(calcularEstado(3, aprobadas, prerrequisitos)).toBe("bloqueada");

    const sinAprobadas = new Set<number>();
    expect(calcularEstado(3, sinAprobadas, prerrequisitos)).toBe("bloqueada");

    const cadenaDeTres = calcularCadena(3, prerrequisitos);
    expect([...cadenaDeTres.prerrequisitos].sort()).toEqual([1, 2]);
    expect(cadenaDeTres.dependientes).toEqual([]);

    const cadenaDeUno = calcularCadena(1, prerrequisitos);
    expect(cadenaDeUno.prerrequisitos).toEqual([]);
    expect([...cadenaDeUno.dependientes].sort()).toEqual([2, 3, 4]);
  });

  it("2.4 lista la malla de la carrera y el avance del estudiante demo", () => {
    const db = baseSembrada();
    const carreraId = (
      db.prepare("SELECT id FROM carrera WHERE nombre = ?").get("Ingeniería Civil Informática") as {
        id: number;
      }
    ).id;

    const malla = listarMalla(db, carreraId);
    expect(malla).toHaveLength(13);
    expect(malla.map((asignatura) => asignatura.codigo)).toContain("ECU301");

    const prerrequisitos = listarPrerrequisitos(db);
    expect(prerrequisitos.get(idAsignatura(db, "MAT102"))).toEqual([idAsignatura(db, "MAT101")]);
    expect(prerrequisitos.get(idAsignatura(db, "ECU301"))).toEqual([idAsignatura(db, "MAT102")]);

    const avance = listarAvance(db, idEstudianteDemo(db));
    expect(avance.get(idAsignatura(db, "MAT101"))).toBe("aprobada");
    expect(avance.get(idAsignatura(db, "ING101"))).toBe("en curso");

    db.close();
  });

  it("HU04-E01 · Una asignatura con prerrequisitos y dependientes muestra su cadena y su estado", async () => {
    const db = baseSembrada();
    const app = crearApp(db);

    const respuesta = await request(app).get("/malla?asignatura=MAT102");

    expect(respuesta.status).toBe(200);

    const mat101 = tarjeta(respuesta.text, "MAT101");
    expect(mat101).toContain('data-estado="aprobada"');
    expect(mat101).toContain("relacionada");

    const mat102 = tarjeta(respuesta.text, "MAT102");
    expect(mat102).toContain('data-estado="disponible"');
    expect(mat102).toContain("seleccionada");

    const ecu301 = tarjeta(respuesta.text, "ECU301");
    expect(ecu301).toContain('data-estado="bloqueada"');
    expect(ecu301).toContain("relacionada");

    const bd101 = tarjeta(respuesta.text, "BD101");
    expect(bd101).toContain("atenuada");

    expect(respuesta.text).toContain("MAT101 Cálculo I");
    expect(respuesta.text).toContain("ECU301 Ecuaciones Diferenciales Aplicadas");

    db.close();
  });

  it("HU04-E02 · Una asignatura sin prerrequisitos muestra solo las asignaturas que dependen de ella", async () => {
    const db = baseSembrada();
    const app = crearApp(db);

    const respuesta = await request(app).get("/malla?asignatura=MAT101");

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain("Sin prerrequisitos");
    expect(respuesta.text).toContain("MAT102 Cálculo II");
    expect(respuesta.text).toContain("ECU301 Ecuaciones Diferenciales Aplicadas");

    expect(tarjeta(respuesta.text, "MAT101")).toContain("seleccionada");
    expect(tarjeta(respuesta.text, "MAT102")).toContain("relacionada");

    db.close();
  });

  it("3.4 muestra «En curso» como etiqueta sin cuarto color", async () => {
    const db = baseSembrada();
    const app = crearApp(db);

    const respuesta = await request(app).get("/malla?asignatura=ING101");
    const ing101 = tarjeta(respuesta.text, "ING101");

    expect(ing101).toContain('data-estado="disponible"');
    expect(ing101).toContain("En curso");
    expect(ing101).toContain("estado-disponible");

    db.close();
  });
});
