import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFolder } from "../api/foldersApi";
import { folderContentsQueryKey } from "./useFolderContents";

export const useDeleteFolder = (parentFolderId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: folderContentsQueryKey(parentFolderId),
      });
    },
  });
};
