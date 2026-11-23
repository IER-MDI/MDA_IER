import { describe, expect, it } from "vitest";
import request from "supertest";
import { crearApp } from "../src/app";
import { dibujarEstrellas, formatearNota, redondearUnDecimal } from "../src/dominio/metricas";
import { obtenerMetricasSeccion } from "../src/dominio/repositorios";
import { baseSembrada, idAsignatura } from "./ayuda";

describe("HU-03 · Referencias comunitarias y dificultad docente", () => {
  it("1.3 calcula los promedios por asignatura y docente", () => {
    const db = baseSembrada();

    const mat101 = obtenerMetricasSeccion(db, idAsignatura(db, "MAT101"), "Prof. Ana Pérez");
    expect(mat101).toEqual({ total: 3, valoracionDocente: 4, dificultad: 4.3 });

    const mat102 = obtenerMetricasSeccion(db, idAsignatura(db, "MAT102"), "Prof. Ana Pérez");
    expect(mat102).toEqual({ total: 0, valoracionDocente: null, dificultad: null });

    db.close();
  });

  it("1.4 redondea, formatea con coma y dibuja las estrellas", () => {
    expect(redondearUnDecimal(4.333333)).toBe(4.3);
    expect(formatearNota(redondearUnDecimal(4.333333))).toBe("4,3");
    expect(formatearNota(4)).toBe("4,0");
    expect(dibujarEstrellas(4)).toBe("★★★★☆");
  });

  it("HU03-E01 · Una sección con evaluaciones muestra la valoración del docente y la dificultad de la asignatura", async () => {
    const db = baseSembrada();
    const app = crearApp(db);

    const respuesta = await request(app).get("/planificador");

    expect(respuesta.status).toBe(200);
    expect(respuesta.text).toContain("4,0 de 5");
    expect(respuesta.text).toContain("4,3 de 5");
    expect(respuesta.text).toContain("★★★★☆");

    const columnas = db.prepare("PRAGMA table_info(evaluacion)").all() as { name: string }[];
    expect(columnas.map((columna) => columna.name)).not.toContain("estudiante_id");

    db.close();
  });

  it("HU03-E02 · Una sección sin evaluaciones no muestra valores inventados", async () => {
    const db = baseSembrada();
    const app = crearApp(db);

    const respuesta = await request(app).get("/planificador");
    const filaMat102 = respuesta.text.match(/<tr>[\s\S]*?MAT102[\s\S]*?<\/tr>/)?.[0] ?? "";

    expect(respuesta.status).toBe(200);
    expect(filaMat102).toContain("Sin evaluaciones");
    expect(filaMat102).not.toContain("0,0 de 5");

    db.close();
  });
});
