import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserShares, revokeUserShare, shareWithUser } from "../api/userSharesApi";
import type { SharePermission } from "../models/FileShare";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "./useFileSystemTree";

export const USER_SHARES_QUERY_KEY = ["user-shares"] as const;

export const useUserShares = (fileId: string | null) =>
  useQuery({
    queryKey: [...USER_SHARES_QUERY_KEY, fileId],
    queryFn: () => getUserShares(fileId!),
    enabled: fileId !== null,
  });

interface ShareWithUserVariables {
  fileId: string;
  email: string;
  permission: SharePermission;
  expiresAt: string | null;
}

export const useShareWithUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, email, permission, expiresAt }: ShareWithUserVariables) =>
      shareWithUser(fileId, email, permission, expiresAt),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: [...USER_SHARES_QUERY_KEY, fileId] });
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};

export const useRevokeUserShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shareId }: { shareId: string; fileId: string }) => revokeUserShare(shareId),
    onSuccess: (_, { fileId }) => {
      queryClient.invalidateQueries({ queryKey: [...USER_SHARES_QUERY_KEY, fileId] });
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
  });
};
