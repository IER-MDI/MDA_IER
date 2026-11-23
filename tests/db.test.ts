import { describe, expect, it } from "vitest";
import { crearBase } from "../src/db/conexion";
import { sembrar } from "../src/db/seed";
import { baseSembrada, sumaCreditos } from "./ayuda";

describe("Base de datos", () => {
  it("una base vacía queda con todas las tablas", () => {
    const db = crearBase(":memory:");
    const tablas = (
      db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        .all() as { name: string }[]
    ).map((fila) => fila.name);

    expect(tablas).toEqual(
      expect.arrayContaining([
        "schema_migrations",
        "carrera",
        "estudiante",
        "asignatura",
        "oferta_academica",
        "seccion",
        "bloque_horario",
        "simulacion",
        "simulacion_seccion",
        "evaluacion",
        "asignatura_cursada",
        "carrera_asignatura",
        "asignatura_prerrequisito",
      ])
    );
    db.close();
  });

  it("el seed es idempotente y deja las combinaciones de 11 y 28 créditos", () => {
    const db = baseSembrada();
    sembrar(db);

    const secciones = db.prepare("SELECT COUNT(*) AS total FROM seccion").get() as { total: number };
    const bloques = db.prepare("SELECT COUNT(*) AS total FROM bloque_horario").get() as { total: number };
    const migraciones = db.prepare("SELECT COUNT(*) AS total FROM schema_migrations").get() as { total: number };
    const evaluaciones = db.prepare("SELECT COUNT(*) AS total FROM evaluacion").get() as { total: number };
    const evaluacionesMat101 = db
      .prepare(
        "SELECT COUNT(*) AS total FROM evaluacion e " +
          "JOIN asignatura a ON a.id = e.asignatura_id WHERE a.codigo = 'MAT101'"
      )
      .get() as { total: number };

    expect(secciones.total).toBe(8);
    expect(bloques.total).toBe(15);
    expect(migraciones.total).toBe(3);
    expect(evaluaciones.total).toBe(3);
    expect(evaluacionesMat101.total).toBe(3);
    expect(sumaCreditos(db, ["MAT101", "MAT102"])).toBe(11);
    expect(sumaCreditos(db, ["MAT101", "PROG101", "BD101", "ING101", "ECO101"])).toBe(28);
    db.close();
  });
});
