import { useQuery } from "@tanstack/react-query";
import { getFolderSubtree } from "../api/userSharesApi";

export const FOLDER_SUBTREE_QUERY_KEY = ["folder-subtree"] as const;

export const useFolderSubtree = (nodeId: string) =>
  useQuery({
    queryKey: [...FOLDER_SUBTREE_QUERY_KEY, nodeId],
    queryFn: () => getFolderSubtree(nodeId),
  });
