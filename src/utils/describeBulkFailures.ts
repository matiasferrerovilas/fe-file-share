import type { FileSystemNode } from "../models/FileSystemNode";

/**
 * Builds a comma-separated list of which items failed in a bulk operation, from the same
 * Promise.allSettled results array (same order as `nodes`) the caller already has — so a "N of M
 * failed" toast can say *which* N, not just the count.
 */
export function describeBulkFailures(nodes: FileSystemNode[], results: PromiseSettledResult<unknown>[]): string {
  return nodes
    .filter((_, index) => results[index]?.status === "rejected")
    .map((node) => node.name)
    .join(", ");
}
