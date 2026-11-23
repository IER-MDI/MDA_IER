ALTER TABLE oferta_academica
  ADD COLUMN estado TEXT NOT NULL DEFAULT 'Publicada'
  CHECK (estado IN (
    'Archivo recibido',
    'Mapeo en revisión',
    'Mapeo confirmado',
    'Con inconsistencias',
    'Estructurada',
    'Publicada',
    'Rechazada'
  ));

ALTER TABLE oferta_academica ADD COLUMN borrador TEXT;
