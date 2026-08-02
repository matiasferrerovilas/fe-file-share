import { describe, it, expect, vi, afterEach } from "vitest";
import { HomeOutlined, QuestionOutlined } from "@ant-design/icons";
import { getIconComponent } from "../../src/utils/getIconComponent";

describe("getIconComponent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna el componente correspondiente cuando el ícono existe", () => {
    expect(getIconComponent("HomeOutlined")).toBe(HomeOutlined);
  });

  it("retorna QuestionOutlined cuando no se pasa nombre", () => {
    expect(getIconComponent()).toBe(QuestionOutlined);
  });

  it("retorna QuestionOutlined cuando el nombre es null", () => {
    expect(getIconComponent(null)).toBe(QuestionOutlined);
  });

  it("retorna QuestionOutlined y loguea un warning cuando el ícono no existe en el mapa", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getIconComponent("IconoInexistente")).toBe(QuestionOutlined);
    expect(warnSpy).toHaveBeenCalledOnce();
  });
});
