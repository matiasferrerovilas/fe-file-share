import { api } from "./axios";
import type {
  ConfirmInvitations,
  CreateInvitationForm,
  CreateWorkspaceForm,
  Invitations,
  Workspace,
} from "../models/Workspace";

const baseUrl = "/workspace";

export const getAllUserWorkspaces = () =>
  api.get<Workspace[]>(baseUrl).then((r) => r.data);

export const addWorkspaceApi = (workspace: CreateWorkspaceForm) =>
  api.post(baseUrl, workspace).then((r) => r.data);

export const exitWorkspaceApi = (id: number) =>
  api.delete(`${baseUrl}/${id}`).then((r) => r.data);

export const removeWorkspaceMemberApi = (workspaceId: number, userId: number) =>
  api.delete(`${baseUrl}/${workspaceId}/members/${userId}`).then((r) => r.data);

export const addInvitationWorkspaceApi = (invitation: CreateInvitationForm) =>
  api
    .post(`${baseUrl}/${invitation.workspaceId}/invitations`, invitation)
    .then((r) => r.data);

export const getAllWorkspaceInvitations = () =>
  api.get<Invitations[]>(`${baseUrl}/invitations`).then((r) => r.data);

export const acceptRejectWorkspaceInvitationApi = (confirmInvitations: ConfirmInvitations) =>
  api
    .patch(`${baseUrl}/invitations/${confirmInvitations.id}`, confirmInvitations)
    .then((r) => r.data);
