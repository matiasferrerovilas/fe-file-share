import { useQuery } from "@tanstack/react-query";
import { getFileActivity } from "../api/foldersApi";

export const FILE_ACTIVITY_QUERY_KEY = ["file-activity"] as const;

export const useFileActivity = (nodeId: string | null) =>
  useQuery({
    queryKey: [...FILE_ACTIVITY_QUERY_KEY, nodeId],
    queryFn: () => getFileActivity(nodeId!),
    enabled: nodeId !== null,
  });
