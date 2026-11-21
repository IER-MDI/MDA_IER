import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const carpetaMigraciones = path.join(aqui, "migrations");

export type BaseDatos = Database.Database;

export function rutaBasePorDefecto(): string {
  return process.env.SGAI_DB ?? path.join(process.cwd(), "data", "app.db");
}

export function crearBase(ruta: string = rutaBasePorDefecto()): BaseDatos {
  if (ruta !== ":memory:") {
    fs.mkdirSync(path.dirname(ruta), { recursive: true });
  }
  const db = new Database(ruta);
  db.pragma("foreign_keys = ON");
  aplicarMigraciones(db);
  return db;
}

export function aplicarMigraciones(db: BaseDatos): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (" +
      "version TEXT PRIMARY KEY, " +
      "aplicada_en TEXT NOT NULL DEFAULT (datetime('now'))" +
      ")"
  );

  const aplicadas = new Set(
    db.prepare("SELECT version FROM schema_migrations").all().map((fila) => String((fila as { version: string }).version))
  );

  const archivos = fs
    .readdirSync(carpetaMigraciones)
    .filter((archivo) => archivo.endsWith(".sql"))
    .sort();

  const registrar = db.prepare("INSERT INTO schema_migrations (version) VALUES (?)");

  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(carpetaMigraciones, archivo), "utf8");
    db.transaction(() => {
      db.exec(sql);
      registrar.run(archivo);
    })();
  }
}
