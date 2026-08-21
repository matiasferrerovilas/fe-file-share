export interface WorkspaceMemberDetail {
  userId: number;
  email: string;
  role: string;
}

export interface WorkspaceMetadata {
  members: string[];
  memberDetails: WorkspaceMemberDetail[];
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

export interface CreateInvitationForm {
  emails: string[];
  workspaceId: number;
}

export interface Invitations {
  id: number;
  workspaceId: number;
  workspaceName: string;
  invitedByEmail: string;
  status: string;
  createdAt: string;
}

export interface ConfirmInvitations {
  status: boolean;
  id: number;
}
