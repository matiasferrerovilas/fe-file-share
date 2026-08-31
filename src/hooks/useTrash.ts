import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrash, restoreNode, purgeNode } from "../api/foldersApi";
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

export const usePurgeNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nodeId: string) => purgeNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRASH_QUERY_KEY });
      // A diferencia de restoreNode, esto no toca el árbol/favoritos/recientes: el nodo ya
      // estaba fuera de todos esos desde que se envió a la papelera. Solo el uso de almacenamiento
      // cambia, porque ahora sí se liberó espacio en disco.
      queryClient.invalidateQueries({ queryKey: WORKSPACE_USAGE_QUERY_KEY });
    },
  });
};
