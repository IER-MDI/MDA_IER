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
