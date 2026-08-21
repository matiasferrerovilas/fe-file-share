import { useQuery } from "@tanstack/react-query";
import { getAllUserWorkspaces, getAllWorkspaceInvitations } from "../api/workspaceApi";

export const USER_WORKSPACES_QUERY_KEY = ["user-workspaces"] as const;
const INVITATIONS_WORKSPACES_QUERY_KEY = ["workspace-invitations"] as const;

export const useWorkspaces = () =>
  useQuery({
    queryKey: USER_WORKSPACES_QUERY_KEY,
    queryFn: getAllUserWorkspaces,
    staleTime: 5 * 60 * 1000,
  });

export const useWorkspaceInvitations = () =>
  useQuery({
    queryKey: INVITATIONS_WORKSPACES_QUERY_KEY,
    queryFn: getAllWorkspaceInvitations,
    staleTime: 5 * 60 * 1000,
  });
