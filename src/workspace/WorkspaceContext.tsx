import { createContext, useContext } from "react";
import type { Workspace } from "../models/Workspace";

export interface WorkspaceContextValue {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspaceId: number) => void;
  isLoading: boolean;
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: () => {},
  isLoading: true,
});

export function useCurrentWorkspace(): WorkspaceContextValue {
  return useContext(WorkspaceContext);
}
