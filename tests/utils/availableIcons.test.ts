import { describe, it, expect } from "vitest";
import { AVAILABLE_ICONS, searchIcons, getIconByName } from "../../src/utils/availableIcons";

describe("searchIcons", () => {
  it("retorna todos los íconos cuando el término está vacío", () => {
    expect(searchIcons("")).toEqual(AVAILABLE_ICONS);
  });

  it("retorna todos los íconos cuando el término es solo espacios", () => {
    expect(searchIcons("   ")).toEqual(AVAILABLE_ICONS);
  });

  it("filtra por nombre de ícono (case-insensitive)", () => {
    const result = searchIcons("homeoutlined");
    expect(result.some((icon) => icon.name === "HomeOutlined")).toBe(true);
  });

  it("filtra por keyword en español", () => {
    const result = searchIcons("supermercado");
    expect(result.some((icon) => icon.name === "ShoppingCartOutlined")).toBe(true);
  });

  it("retorna un array vacío cuando no hay coincidencias", () => {
    expect(searchIcons("xyznomatch")).toEqual([]);
  });
});

describe("getIconByName", () => {
  it("retorna el ícono cuando el nombre existe exactamente", () => {
    expect(getIconByName("HomeOutlined")?.name).toBe("HomeOutlined");
  });

  it("retorna undefined cuando el nombre no existe", () => {
    expect(getIconByName("NoExiste")).toBeUndefined();
  });

  it("es case-sensitive en la búsqueda exacta", () => {
    expect(getIconByName("homeoutlined")).toBeUndefined();
  });
});
