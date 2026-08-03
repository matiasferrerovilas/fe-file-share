import type { FileSystemNode } from "../models/FileSystemNode";

export interface FileSystemSearchResult {
  node: FileSystemNode;
  path: FileSystemNode[];
}

export function searchFileSystemTree(nodes: FileSystemNode[], query: string): FileSystemSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: FileSystemSearchResult[] = [];

  const walk = (node: FileSystemNode, ancestors: FileSystemNode[]) => {
    const path = [...ancestors, node];
    if (node.name.toLowerCase().includes(normalized)) {
      results.push({ node, path });
    }
    node.children?.forEach((child) => walk(child, path));
  };

  nodes.forEach((node) => walk(node, []));
  return results;
}
