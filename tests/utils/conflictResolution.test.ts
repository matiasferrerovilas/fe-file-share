import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import { parseChecksumConflict, parseNameConflict, suggestAlternativeName } from "../../src/utils/conflictResolution";

function axiosErrorWithDetail(status: number, detail?: string): AxiosError {
  const error = new AxiosError("Request failed");
  error.response = {
    status,
    statusText: "",
    headers: {},
    // @ts-expect-error minimal config stub for the test
    config: {},
    data: detail !== undefined ? { statusCode: String(status), title: "Bad Request", detail } : undefined,
  };
  return error;
}

describe("parseNameConflict", () => {
  it("extracts the conflicting name from a 400 name-collision response", () => {
    const error = axiosErrorWithDetail(400, "Ya existe un archivo con el nombre 'Notas.txt' en ese destino");

    expect(parseNameConflict(error)).toBe("Notas.txt");
  });

  it("returns null for a 400 that isn't a name collision", () => {
    const error = axiosErrorWithDetail(400, "El archivo supera el tamaño máximo permitido de 50MB");

    expect(parseNameConflict(error)).toBeNull();
  });

  it("returns null for a non-400 error", () => {
    const error = axiosErrorWithDetail(403, "Ya existe un archivo con el nombre 'Notas.txt' en ese destino");

    expect(parseNameConflict(error)).toBeNull();
  });

  it("returns null for a non-axios error", () => {
    expect(parseNameConflict(new Error("boom"))).toBeNull();
  });
});

describe("parseChecksumConflict", () => {
  it("extracts the existing file's name from a 409 checksum-duplicate response", () => {
    const error = axiosErrorWithDetail(409, "El contenido ya existe en este workspace como 'Vacaciones.txt'");

    expect(parseChecksumConflict(error)).toBe("Vacaciones.txt");
  });

  it("returns null for a 409 that isn't a checksum duplicate", () => {
    const error = axiosErrorWithDetail(409, "Ya existe un share con esa api para este archivo");

    expect(parseChecksumConflict(error)).toBeNull();
  });

  it("returns null for a non-409 error, even a name collision", () => {
    const error = axiosErrorWithDetail(400, "Ya existe un archivo con el nombre 'Notas.txt' en ese destino");

    expect(parseChecksumConflict(error)).toBeNull();
  });

  it("returns null for a non-axios error", () => {
    expect(parseChecksumConflict(new Error("boom"))).toBeNull();
  });
});

describe("suggestAlternativeName", () => {
  it("appends ' (2)' before the extension", () => {
    expect(suggestAlternativeName("Notas.txt")).toBe("Notas (2).txt");
  });

  it("appends ' (2)' with no extension", () => {
    expect(suggestAlternativeName("Fotos")).toBe("Fotos (2)");
  });

  it("increments an existing trailing number", () => {
    expect(suggestAlternativeName("Notas (2).txt")).toBe("Notas (3).txt");
  });

  it("increments an existing trailing number with no extension", () => {
    expect(suggestAlternativeName("Fotos (4)")).toBe("Fotos (5)");
  });

  it("only strips the last extension for a multi-dot name", () => {
    expect(suggestAlternativeName("archive.tar.gz")).toBe("archive.tar (2).gz");
  });
});
