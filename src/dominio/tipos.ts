export interface Bloque {
  id: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface AsignaturaDeSeccion {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  semestreSugerido: number;
}

export interface Seccion {
  id: number;
  numero: number;
  docente: string;
  cupos: number;
  asignatura: AsignaturaDeSeccion;
  bloques: Bloque[];
}

export interface Simulacion {
  id: number;
  estudianteId: number;
  nombre: string;
  estado: string;
}

export interface Evaluacion {
  id: number;
  asignaturaId: number;
  docente: string;
  calificacionDocente: number;
  dificultadPercibida: number;
  comentario: string | null;
}

export interface MetricasSeccion {
  total: number;
  valoracionDocente: number | null;
  dificultad: number | null;
}

export type ResultadoAsignatura = "aprobada" | "reprobada" | "en curso";

export type EstadoAsignatura = "aprobada" | "disponible" | "bloqueada";

export interface AsignaturaEnMalla {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  semestreSugerido: number;
}

export interface CadenaAsignatura {
  prerrequisitos: number[];
  dependientes: number[];
}

export const DIAS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] as const;

export const ETIQUETAS_DIA: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const FRANJAS = [
  { inicio: "08:30", fin: "09:50" },
  { inicio: "10:00", fin: "11:20" },
] as const;
