import { describe, it, expect } from "vitest";
import { describeBulkFailures } from "../../src/utils/describeBulkFailures";
import { FileSystemNodeType, type FileSystemNode } from "../../src/models/FileSystemNode";

function nodeAt(id: string, name: string): FileSystemNode {
  return {
    id,
    name,
    children: null,
    shareWith: null,
    metadata: {
      size: 0,
      lastModified: "2026-08-21T00:00:00Z",
      createdAt: "2026-08-21T00:00:00Z",
      type: FileSystemNodeType.FILE,
      contentType: null,
      checksum: null,
      favorite: false,
      lastAccessedAt: null,
    },
  };
}

describe("describeBulkFailures", () => {
  it("lists only the names of the failed items, in order", () => {
    const nodes = [nodeAt("1", "a.txt"), nodeAt("2", "b.txt"), nodeAt("3", "c.txt")];
    const results: PromiseSettledResult<unknown>[] = [
      { status: "fulfilled", value: undefined },
      { status: "rejected", reason: new Error("nope") },
      { status: "rejected", reason: new Error("nope") },
    ];

    expect(describeBulkFailures(nodes, results)).toBe("b.txt, c.txt");
  });

  it("returns an empty string when nothing failed", () => {
    const nodes = [nodeAt("1", "a.txt")];
    const results: PromiseSettledResult<unknown>[] = [{ status: "fulfilled", value: undefined }];

    expect(describeBulkFailures(nodes, results)).toBe("");
  });

  it("returns all names when everything failed", () => {
    const nodes = [nodeAt("1", "a.txt"), nodeAt("2", "b.txt")];
    const results: PromiseSettledResult<unknown>[] = [
      { status: "rejected", reason: new Error("nope") },
      { status: "rejected", reason: new Error("nope") },
    ];

    expect(describeBulkFailures(nodes, results)).toBe("a.txt, b.txt");
  });
});
