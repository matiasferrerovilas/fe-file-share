import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchFiles } from "../api/foldersApi";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";

export const FILE_SEARCH_QUERY_KEY = ["file-search"] as const;

const DEBOUNCE_MS = 300;

/**
 * Backs the top-bar search: debounces the raw input before hitting `GET /v1/folders/search`, so
 * the backend (an indexed SQL LIKE, scaling to a real workspace's worth of files/content) isn't
 * hit on every keystroke. Replaces the old client-side `searchFileSystemTree` full-tree walk.
 */
export const useFileSearch = (query: string) => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = debouncedQuery.trim();

  const queryResult = useQuery({
    queryKey: [...FILE_SEARCH_QUERY_KEY, workspaceId, trimmed],
    queryFn: () => searchFiles(workspaceId!, trimmed),
    enabled: workspaceId !== undefined && trimmed !== "",
  });

  return {
    ...queryResult,
    results: trimmed === "" ? [] : (queryResult.data ?? []),
    isSearching: trimmed !== query.trim() || queryResult.isFetching,
  };
};
