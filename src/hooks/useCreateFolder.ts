import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";

interface CreateFolderVariables {
  folderId: string;
  name: string;
}

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  return useMutation({
    mutationFn: ({ folderId, name }: CreateFolderVariables) =>
      createFolder(currentWorkspace!.workspaceId, folderId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
