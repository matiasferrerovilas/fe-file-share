import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setFolderCustomization } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

interface SetFolderCustomizationVariables {
  nodeId: string;
  color: string | null;
  icon: string | null;
}

export const useSetFolderCustomization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, color, icon }: SetFolderCustomizationVariables) =>
      setFolderCustomization(nodeId, color, icon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
