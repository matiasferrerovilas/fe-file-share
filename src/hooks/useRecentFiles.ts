import { useQuery } from "@tanstack/react-query";
import { getRecentFiles } from "../api/foldersApi";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";

export const RECENT_FILES_QUERY_KEY = ["recent-files"] as const;

export const useRecentFiles = (limit?: number) => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;

  return useQuery({
    queryKey: [...RECENT_FILES_QUERY_KEY, workspaceId, limit],
    queryFn: () => getRecentFiles(workspaceId!, limit),
    enabled: workspaceId !== undefined,
  });
};
