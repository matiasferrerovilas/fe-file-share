import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrash, restoreNode } from "../api/foldersApi";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";
import { FAVORITES_QUERY_KEY } from "./useFavorites";
import { RECENT_FILES_QUERY_KEY } from "./useRecentFiles";
import { WORKSPACE_USAGE_QUERY_KEY } from "./useWorkspaceUsage";

export const TRASH_QUERY_KEY = ["trash"] as const;

export const useTrash = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;

  return useQuery({
    queryKey: [...TRASH_QUERY_KEY, workspaceId],
    queryFn: () => getTrash(workspaceId!),
    enabled: workspaceId !== undefined,
  });
};

export const useRestoreNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) => restoreNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRASH_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RECENT_FILES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_USAGE_QUERY_KEY });
    },
  });
};
