import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getShares, revokeShare } from "../api/sharesApi";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

interface RevokeShareVariables {
  fileId: string;
  apiName: string;
}

/**
 * Revoking is by share id (`DELETE /v1/shares/{id}`), but the UI only knows the file + target api
 * — resolves the id by re-fetching the file's current shares and finding the matching one.
 */
export const useRevokeShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, apiName }: RevokeShareVariables) => {
      const shares = await getShares(fileId);
      const share = shares.find((s) => s.apiName === apiName);
      if (!share) return;
      await revokeShare(share.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
