import { describe, it, expect } from "vitest";
import {
  isImageContentType,
  isPdfContentType,
  isMarkdownFile,
  isPlainTextFile,
  isPreviewableContentType,
} from "../../src/utils/filePreview";

describe("isImageContentType", () => {
  it("returns true for image/* content types", () => {
    expect(isImageContentType("image/png")).toBe(true);
  });

  it("returns false for null or non-image content types", () => {
    expect(isImageContentType(null)).toBe(false);
    expect(isImageContentType("application/pdf")).toBe(false);
  });
});

describe("isPdfContentType", () => {
  it("returns true only for application/pdf", () => {
    expect(isPdfContentType("application/pdf")).toBe(true);
    expect(isPdfContentType("application/octet-stream")).toBe(false);
  });
});

describe("isMarkdownFile", () => {
  it("recognizes markdown content types", () => {
    expect(isMarkdownFile("notas", "text/markdown")).toBe(true);
  });

  it("recognizes .md and .markdown extensions when content-type detection is unreliable", () => {
    expect(isMarkdownFile("Notas.md", null)).toBe(true);
    expect(isMarkdownFile("Notas.MD", "application/octet-stream")).toBe(true);
    expect(isMarkdownFile("readme.markdown", null)).toBe(true);
  });

  it("returns false for a plain text file", () => {
    expect(isMarkdownFile("notas.txt", "text/plain")).toBe(false);
  });
});

describe("isPlainTextFile", () => {
  it("recognizes text/plain content type", () => {
    expect(isPlainTextFile("notas", "text/plain")).toBe(true);
  });

  it("recognizes .txt extension", () => {
    expect(isPlainTextFile("Notas.txt", null)).toBe(true);
  });

  it("does not classify a markdown file as plain text", () => {
    expect(isPlainTextFile("Notas.md", "text/plain")).toBe(false);
  });

  it("returns false for other file types", () => {
    expect(isPlainTextFile("factura.pdf", "application/pdf")).toBe(false);
  });
});

describe("isPreviewableContentType", () => {
  it("is true for images, PDFs, markdown and plain text", () => {
    expect(isPreviewableContentType("foto.png", "image/png")).toBe(true);
    expect(isPreviewableContentType("factura.pdf", "application/pdf")).toBe(true);
    expect(isPreviewableContentType("notas.md", null)).toBe(true);
    expect(isPreviewableContentType("notas.txt", "text/plain")).toBe(true);
  });

  it("is false for other binary formats", () => {
    expect(isPreviewableContentType("archivo.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBe(false);
  });
});
