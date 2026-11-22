export function redondearUnDecimal(valor: number): number {
  return Math.round(valor * 10) / 10;
}

export function formatearNota(valor: number): string {
  return valor.toFixed(1).replace(".", ",");
}

export function dibujarEstrellas(valor: number): string {
  const llenas = Math.min(5, Math.max(0, Math.round(valor)));
  return "★".repeat(llenas) + "☆".repeat(5 - llenas);
}
