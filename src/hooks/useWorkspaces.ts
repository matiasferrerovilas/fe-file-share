import { useQuery } from "@tanstack/react-query";
import { getAllUserWorkspaces } from "../api/workspaceApi";

export const USER_WORKSPACES_QUERY_KEY = ["user-workspaces"] as const;

export const useWorkspaces = () =>
  useQuery({
    queryKey: USER_WORKSPACES_QUERY_KEY,
    queryFn: getAllUserWorkspaces,
    staleTime: 5 * 60 * 1000,
  });
