import type { WorkspaceRoleEnum } from "../enums/WorkspaceRoleEnum";

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
  // Rol con el que se une el invitado si acepta — api-identity lo setea en el membership recién
  // en ese momento (ver WorkspaceMembershipService.addMembership).
  role: WorkspaceRoleEnum;
}

export interface Invitations {
  id: number;
  workspaceId: number;
  workspaceName: string;
  invitedByEmail: string;
  status: string;
  role: WorkspaceRoleEnum;
  createdAt: string;
}

export interface SentInvitation {
  id: number;
  workspaceId: number;
  workspaceName: string;
  invitedUserEmail: string;
  status: string;
  role: WorkspaceRoleEnum;
  createdAt: string;
}

export interface ConfirmInvitations {
  status: boolean;
  id: number;
}
