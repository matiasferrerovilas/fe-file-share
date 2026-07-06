import type { FileSystemNode } from "../models/FileSystemNode";

export function findNode(nodes: FileSystemNode[], id: string): FileSystemNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export function findPath(nodes: FileSystemNode[], id: string): FileSystemNode[] {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const childPath = findPath(node.children, id);
    if (childPath.length) return [node, ...childPath];
  }
  return [];
}
