export interface WorkspaceMetadata {
  members: string[];
  role: string;
  joinedAt: string;
  isDefault: boolean;
}

export interface Workspace {
  id: number;
  workspaceId: number;
  workspaceName: string;
  metadata: WorkspaceMetadata;
}

export interface CreateWorkspaceForm {
  description: string;
}
