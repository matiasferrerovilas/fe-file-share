import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameNode } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

interface RenameNodeVariables {
  nodeId: string;
  name: string;
}

export const useRenameNode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nodeId, name }: RenameNodeVariables) => renameNode(nodeId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
