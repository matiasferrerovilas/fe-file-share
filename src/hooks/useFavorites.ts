import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFavorites, setFavorite } from "../api/foldersApi";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

export const FAVORITES_QUERY_KEY = ["favorites"] as const;

export const useFavorites = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;

  return useQuery({
    queryKey: [...FAVORITES_QUERY_KEY, workspaceId],
    queryFn: () => getFavorites(workspaceId!),
    enabled: workspaceId !== undefined,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, favorite }: { nodeId: string; favorite: boolean }) => setFavorite(nodeId, favorite),
    onSuccess: () => {
      // Afecta tanto al árbol (la estrella se ve en cualquier vista de carpeta) como a la lista
      // de favoritos dedicada.
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
    },
  });
};
