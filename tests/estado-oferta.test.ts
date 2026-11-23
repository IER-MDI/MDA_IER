import { describe, expect, it } from "vitest";
import { aplicarTransicion } from "../src/dominio/estadoOferta";

describe("HU-01 · EST-01 del ciclo de Oferta Académica", () => {
  it("recorre todas las transiciones válidas", () => {
    expect(aplicarTransicion("Inicio", "solicitarArchivo")).toBe("Archivo recibido");
    expect(aplicarTransicion("Archivo recibido", "evaluarFormato", true)).toBe("Mapeo en revisión");
    expect(aplicarTransicion("Archivo recibido", "evaluarFormato", false)).toBe("Rechazada");
    expect(aplicarTransicion("Mapeo en revisión", "confirmarMapeo")).toBe("Mapeo confirmado");
    expect(aplicarTransicion("Mapeo confirmado", "validarDatos", true)).toBe("Estructurada");
    expect(aplicarTransicion("Mapeo confirmado", "validarDatos", false)).toBe("Con inconsistencias");
    expect(aplicarTransicion("Con inconsistencias", "corregirMapeo")).toBe("Mapeo en revisión");
    expect(aplicarTransicion("Estructurada", "confirmarPublicacion")).toBe("Publicada");
  });

  it("rechaza transiciones inválidas con mensaje claro", () => {
    expect(() => aplicarTransicion("Publicada", "confirmarMapeo")).toThrow(
      /Transición inválida: desde «Publicada» no se permite «confirmarMapeo»/
    );
    expect(() => aplicarTransicion("Rechazada", "confirmarPublicacion")).toThrow(
      /Transición inválida/
    );
    expect(() => aplicarTransicion("Inicio", "confirmarPublicacion")).toThrow(
      /Transición inválida/
    );
  });
});
