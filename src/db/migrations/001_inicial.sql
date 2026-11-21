CREATE TABLE IF NOT EXISTS carrera (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  duracion_semestres INTEGER NOT NULL,
  tope_creditos_semestre INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS estudiante (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  rut TEXT NOT NULL UNIQUE,
  carrera_id INTEGER NOT NULL REFERENCES carrera(id)
);

CREATE TABLE IF NOT EXISTS asignatura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  creditos INTEGER NOT NULL CHECK (creditos > 0),
  semestre_sugerido INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oferta_academica (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  periodo TEXT NOT NULL UNIQUE,
  fecha_publicacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seccion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  oferta_id INTEGER NOT NULL REFERENCES oferta_academica(id) ON DELETE CASCADE,
  asignatura_id INTEGER NOT NULL REFERENCES asignatura(id),
  numero INTEGER NOT NULL,
  docente TEXT NOT NULL,
  cupos INTEGER NOT NULL CHECK (cupos >= 0),
  UNIQUE (oferta_id, asignatura_id, numero)
);

CREATE TABLE IF NOT EXISTS bloque_horario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seccion_id INTEGER NOT NULL REFERENCES seccion(id) ON DELETE CASCADE,
  dia TEXT NOT NULL CHECK (dia IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  CHECK (hora_inicio < hora_fin),
  UNIQUE (seccion_id, dia, hora_inicio, hora_fin)
);

CREATE TABLE IF NOT EXISTS simulacion (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estudiante_id INTEGER NOT NULL REFERENCES estudiante(id),
  nombre TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en armado' CHECK (estado IN ('en armado', 'confirmada')),
  creada_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS simulacion_seccion (
  simulacion_id INTEGER NOT NULL REFERENCES simulacion(id) ON DELETE CASCADE,
  seccion_id INTEGER NOT NULL REFERENCES seccion(id),
  PRIMARY KEY (simulacion_id, seccion_id)
);
