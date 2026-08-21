import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shareFile } from "../api/sharesApi";
import type { SharePermission } from "../models/FileShare";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

interface ShareFileVariables {
  fileId: string;
  apiName: string;
  permission: SharePermission;
}

export const useShareFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, apiName, permission }: ShareFileVariables) =>
      shareFile(fileId, apiName, permission),
    onSuccess: () => {
      // node.shareWith (el árbol) es lo que decide si el menú ofrece "Compartir" o "Dejar de
      // compartir" para cada target — sin invalidar, queda desactualizado hasta el próximo refetch.
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
