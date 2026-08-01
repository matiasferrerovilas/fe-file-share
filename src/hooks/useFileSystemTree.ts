import { useQuery } from "@tanstack/react-query";
import { getFileSystemTree } from "../api/foldersApi";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";

export const FILE_SYSTEM_TREE_QUERY_KEY = ["file-system-tree"] as const;

export const useFileSystemTree = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;

  return useQuery({
    queryKey: [...FILE_SYSTEM_TREE_QUERY_KEY, workspaceId],
    queryFn: () => getFileSystemTree(workspaceId!),
    enabled: workspaceId !== undefined,
  });
};
