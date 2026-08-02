import { describe, it, expect } from "vitest";
import { formatFileSize } from "../../src/utils/formatFileSize";

describe("formatFileSize", () => {
  it("retorna '0 B' para 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("retorna '0 B' para valores negativos", () => {
    expect(formatFileSize(-100)).toBe("0 B");
  });

  it("formatea bytes sin decimales", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formatea kilobytes con un decimal", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formatea megabytes con un decimal", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  it("formatea gigabytes con un decimal", () => {
    expect(formatFileSize(3 * 1024 ** 3)).toBe("3.0 GB");
  });

  it("no excede la unidad más grande disponible (TB)", () => {
    expect(formatFileSize(2048 * 1024 ** 4)).toBe("2048.0 TB");
  });

  it("redondea el decimal correctamente", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});
