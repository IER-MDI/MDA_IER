CREATE TABLE IF NOT EXISTS evaluacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  docente TEXT NOT NULL,
  calificacion_docente INTEGER NOT NULL CHECK (calificacion_docente BETWEEN 1 AND 5),
  dificultad_percibida INTEGER NOT NULL CHECK (dificultad_percibida BETWEEN 1 AND 5),
  comentario TEXT
);

CREATE INDEX IF NOT EXISTS idx_evaluacion_asignatura_docente
  ON evaluacion (asignatura_id, docente);
