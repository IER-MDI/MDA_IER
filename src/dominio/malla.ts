import type { CadenaAsignatura, EstadoAsignatura } from "./tipos";

export function calcularEstado(
  asignaturaId: number,
  aprobadas: Set<number>,
  prerrequisitos: Map<number, number[]>
): EstadoAsignatura {
  if (aprobadas.has(asignaturaId)) {
    return "aprobada";
  }
  const previos = prerrequisitos.get(asignaturaId) ?? [];
  return previos.every((id) => aprobadas.has(id)) ? "disponible" : "bloqueada";
}

export function calcularCadena(
  asignaturaId: number,
  prerrequisitos: Map<number, number[]>
): CadenaAsignatura {
  const dependientes = new Map<number, number[]>();
  for (const [id, previos] of prerrequisitos) {
    for (const previo of previos) {
      const lista = dependientes.get(previo) ?? [];
      lista.push(id);
      dependientes.set(previo, lista);
    }
  }

  return {
    prerrequisitos: recorrer(asignaturaId, (id) => prerrequisitos.get(id) ?? []),
    dependientes: recorrer(asignaturaId, (id) => dependientes.get(id) ?? []),
  };
}

function recorrer(inicio: number, vecinos: (id: number) => number[]): number[] {
  const visitados = new Set<number>();
  const pendientes = [...vecinos(inicio)];
  const resultado: number[] = [];

  while (pendientes.length > 0) {
    const actual = pendientes.shift();
    if (actual === undefined || actual === inicio || visitados.has(actual)) {
      continue;
    }
    visitados.add(actual);
    resultado.push(actual);
    pendientes.push(...vecinos(actual));
  }

  return resultado;
}
