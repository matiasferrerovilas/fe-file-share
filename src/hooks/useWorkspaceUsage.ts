import { useQuery } from "@tanstack/react-query";
import { getWorkspaceUsage } from "../api/foldersApi";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";

export const WORKSPACE_USAGE_QUERY_KEY = ["workspace-usage"] as const;

export const useWorkspaceUsage = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;

  return useQuery({
    queryKey: [...WORKSPACE_USAGE_QUERY_KEY, workspaceId],
    queryFn: () => getWorkspaceUsage(workspaceId!),
    enabled: workspaceId !== undefined,
  });
};
