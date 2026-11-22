-- HU-05 · Malla curricular y avance del estudiante (modelo de dominio)
CREATE TABLE IF NOT EXISTS asignatura_cursada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL REFERENCES estudiante(id),
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  resultado TEXT NOT NULL CHECK (resultado IN ('aprobada', 'reprobada', 'en curso')),
  periodo TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS carrera_asignatura (
  carrera_id INTEGER NOT NULL REFERENCES carrera(id),
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  PRIMARY KEY (carrera_id, asignatura_id)
);

CREATE TABLE IF NOT EXISTS prerrequisito (
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  prerrequisito_id INTEGER NOT NULL REFERENCES asignatura(id),
  PRIMARY KEY (asignatura_id, prerrequisito_id),
  CHECK (asignatura_id <> prerrequisito_id)
);

CREATE INDEX IF NOT EXISTS idx_asignatura_cursada_estudiante ON asignatura_cursada(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_prerrequisito_prerrequisito ON prerrequisito(prerrequisito_id);
