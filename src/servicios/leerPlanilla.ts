import ExcelJS, { type Worksheet } from "exceljs";
import { parse } from "csv-parse/sync";

export interface FilaPlanilla {
  numero: number;
  celdas: Record<string, string>;
}

export interface PlanillaLeida {
  encabezados: string[];
  filas: FilaPlanilla[];
}

/** Lee un archivo .xlsx (primera hoja) o .csv y devuelve filas de texto. */
export async function leerPlanilla(
  archivo: Buffer,
  extension: string
): Promise<PlanillaLeida> {
  const ext = extension.toLowerCase();
  if (ext === ".csv") {
    return leerCsv(archivo);
  }
  if (ext === ".xlsx") {
    return leerXlsx(archivo);
  }
  throw new Error("Formato no admitido: use .xlsx o .csv");
}

function leerCsv(archivo: Buffer): PlanillaLeida {
  const texto = archivo.toString("utf8");
  const primeraLinea = texto.split(/\r?\n/, 1)[0] ?? "";
  const comas = (primeraLinea.match(/,/g) ?? []).length;
  const puntosYComas = (primeraLinea.match(/;/g) ?? []).length;
  const delimiter = puntosYComas > comas ? ";" : ",";

  const registros = parse(texto, {
    bom: true,
    delimiter,
    relax_column_count: true,
    skip_empty_lines: true,
  }) as string[][];

  if (registros.length === 0) {
    return { encabezados: [], filas: [] };
  }

  const encabezados = registros[0]!.map((celda) => celda.trim());
  const filas = registros.slice(1).map((valores, indice) => ({
    numero: indice + 2,
    celdas: Object.fromEntries(
      encabezados.map((encabezado, columna) => [encabezado, valores[columna] ?? ""])
    ),
  }));

  return { encabezados, filas };
}

async function leerXlsx(archivo: Buffer): Promise<PlanillaLeida> {
  const libro = new ExcelJS.Workbook();
  await libro.xlsx.load(archivo as unknown as Parameters<typeof libro.xlsx.load>[0]);
  const hoja = libro.worksheets[0];
  if (!hoja) {
    return { encabezados: [], filas: [] };
  }

  const encabezados = celdasDeFila(hoja, 1);
  const filas: FilaPlanilla[] = [];

  for (let numero = 2; numero <= hoja.rowCount; numero += 1) {
    const valores = celdasDeFila(hoja, numero);
    if (valores.every((valor) => valor === "")) {
      continue;
    }
    filas.push({
      numero,
      celdas: Object.fromEntries(
        encabezados.map((encabezado, columna) => [encabezado, valores[columna] ?? ""])
      ),
    });
  }

  return { encabezados, filas };
}

function celdasDeFila(hoja: Worksheet, numero: number): string[] {
  const valores = hoja.getRow(numero).values as unknown[] | undefined;
  return (valores ?? []).slice(1).map((valor) => textoCelda(valor));
}

function textoCelda(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }
  if (Array.isArray(valor)) {
    return valor.map((parte) => textoCelda(parte)).join("");
  }
  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10);
  }
  if (typeof valor === "object") {
    const objeto = valor as {
      result?: unknown;
      richText?: { text: string }[];
      text?: unknown;
    };
    if (objeto.richText) {
      return objeto.richText.map((parte) => parte.text).join("");
    }
    if (objeto.result !== undefined) {
      return textoCelda(objeto.result);
    }
    if (objeto.text !== undefined) {
      return textoCelda(objeto.text);
    }
    return "";
  }
  return String(valor).trim();
}
