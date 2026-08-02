import { describe, it, expect } from "vitest";
import { capitalizeFirst } from "../../src/utils/stringFunctions";

describe("capitalizeFirst", () => {
  it("capitaliza la primera letra y pasa el resto a minúsculas", () => {
    expect(capitalizeFirst("hOLA")).toBe("Hola");
  });

  it("retorna '-' cuando el texto es undefined", () => {
    expect(capitalizeFirst(undefined)).toBe("-");
  });

  it("retorna '-' cuando el texto es un string vacío", () => {
    expect(capitalizeFirst("")).toBe("-");
  });

  it("deja intacto un texto ya capitalizado", () => {
    expect(capitalizeFirst("Carpeta")).toBe("Carpeta");
  });

  it("funciona con una sola letra", () => {
    expect(capitalizeFirst("a")).toBe("A");
  });
});
