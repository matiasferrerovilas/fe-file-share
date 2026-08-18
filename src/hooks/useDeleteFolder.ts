import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFolder } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";
import { WORKSPACE_USAGE_QUERY_KEY } from "./useWorkspaceUsage";

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: WORKSPACE_USAGE_QUERY_KEY });
    },
  });
};
