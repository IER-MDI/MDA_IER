CREATE TABLE IF NOT EXISTS carrera_asignatura (
  carrera_id INTEGER NOT NULL REFERENCES carrera(id) ON DELETE CASCADE,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  PRIMARY KEY (carrera_id, asignatura_id)
);

CREATE TABLE IF NOT EXISTS asignatura_prerrequisito (
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  prerrequisito_id INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  PRIMARY KEY (asignatura_id, prerrequisito_id),
  CHECK (asignatura_id <> prerrequisito_id)
);

CREATE TABLE IF NOT EXISTS asignatura_cursada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL REFERENCES estudiante(id) ON DELETE CASCADE,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  resultado TEXT NOT NULL CHECK (resultado IN ('aprobada', 'reprobada', 'en curso')),
  periodo TEXT NOT NULL,
  UNIQUE (estudiante_id, asignatura_id)
);
