import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFileToFolder } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";

interface UploadFileToFolderVariables {
  folderId: string;
  file: File;
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
}

export const useUploadFileToFolder = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  return useMutation({
    mutationFn: ({ folderId, file, onProgress, signal }: UploadFileToFolderVariables) =>
      uploadFileToFolder(currentWorkspace!.workspaceId, folderId, file, onProgress, signal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
