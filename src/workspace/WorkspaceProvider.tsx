import { useCallback, useMemo, useState, type ReactNode } from "react";
import { WorkspaceContext } from "./WorkspaceContext";
import { useWorkspaces } from "../hooks/useWorkspaces";
import { useUserDefault, useSetUserDefault } from "../hooks/useSettings";
import type { Workspace } from "../models/Workspace";

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { data: workspaces = [], isLoading: loadingWorkspaces } = useWorkspaces();
  const { data: defaultWorkspaceSetting, isLoading: loadingDefault } =
    useUserDefault("DEFAULT_WORKSPACE");
  const { mutate: setDefaultWorkspace } = useSetUserDefault();

  const [manualWorkspaceId, setManualWorkspaceId] = useState<number | null>(null);

  const effectiveWorkspaceId = useMemo(() => {
    if (manualWorkspaceId !== null) {
      return manualWorkspaceId;
    }
    if (defaultWorkspaceSetting?.value) {
      return defaultWorkspaceSetting.value;
    }
    if (workspaces.length > 0) {
      return workspaces[0].workspaceId;
    }
    return null;
  }, [manualWorkspaceId, defaultWorkspaceSetting?.value, workspaces]);

  const currentWorkspace = useMemo((): Workspace | null => {
    if (!effectiveWorkspaceId) return null;
    return workspaces.find((w) => w.workspaceId === effectiveWorkspaceId) ?? null;
  }, [workspaces, effectiveWorkspaceId]);

  const setCurrentWorkspace = useCallback(
    (workspaceId: number) => {
      setManualWorkspaceId(workspaceId);
      setDefaultWorkspace({ key: "DEFAULT_WORKSPACE", value: workspaceId });
    },
    [setDefaultWorkspace],
  );

  const isLoading = loadingWorkspaces || loadingDefault;

  const value = useMemo(
    () => ({
      currentWorkspace,
      workspaces,
      setCurrentWorkspace,
      isLoading,
    }),
    [currentWorkspace, workspaces, setCurrentWorkspace, isLoading],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
