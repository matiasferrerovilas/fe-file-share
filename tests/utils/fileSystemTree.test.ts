import { describe, it, expect } from "vitest";
import { findNode, findPath } from "../../src/utils/fileSystemTree";
import type { FileSystemNode } from "../../src/models/FileSystemNode";

const makeNode = (overrides: Partial<FileSystemNode> & { id: string }): FileSystemNode => ({
  name: overrides.id,
  type: "FOLDER",
  size: null,
  lastModified: "2026-01-01T00:00:00Z",
  children: null,
  ...overrides,
});

const tree: FileSystemNode[] = [
  makeNode({
    id: "root",
    children: [
      makeNode({
        id: "docs",
        children: [makeNode({ id: "readme", type: "FILE", children: null })],
      }),
      makeNode({ id: "photos", children: [] }),
    ],
  }),
];

describe("findNode", () => {
  it("encuentra un nodo en el nivel raíz", () => {
    expect(findNode(tree, "root")?.id).toBe("root");
  });

  it("encuentra un nodo anidado en profundidad", () => {
    expect(findNode(tree, "readme")?.id).toBe("readme");
  });

  it("retorna null cuando el id no existe", () => {
    expect(findNode(tree, "no-existe")).toBeNull();
  });

  it("maneja nodos sin children (null) sin lanzar error", () => {
    expect(findNode(tree, "photos")?.id).toBe("photos");
  });
});

describe("findPath", () => {
  it("retorna solo el nodo cuando está en el nivel raíz", () => {
    expect(findPath(tree, "root").map((n) => n.id)).toEqual(["root"]);
  });

  it("retorna el camino completo desde la raíz hasta el nodo anidado", () => {
    expect(findPath(tree, "readme").map((n) => n.id)).toEqual(["root", "docs", "readme"]);
  });

  it("retorna un array vacío cuando el id no existe", () => {
    expect(findPath(tree, "no-existe")).toEqual([]);
  });
});
