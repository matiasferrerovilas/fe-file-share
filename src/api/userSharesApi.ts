import { api } from "./axios";
import type { SharePermission, UserFileShare } from "../models/FileShare";
import type { FileSystemNode } from "../models/FileSystemNode";

export const shareWithUser = (
  fileId: string,
  email: string,
  permission: SharePermission,
  expiresAt: string | null,
) =>
  api
    .post<UserFileShare>("shares/users", { fileId, email, permission, expiresAt })
    .then((r) => r.data);

export const getUserShares = (fileId: string) =>
  api.get<UserFileShare[]>("shares/users", { params: { fileId } }).then((r) => r.data);

export const revokeUserShare = (shareId: string) =>
  api.delete(`shares/users/${shareId}`).then(() => undefined);

export const getSharedWithMe = () =>
  api.get<FileSystemNode[]>("shares/users/shared-with-me").then((r) => r.data);

export const getFolderSubtree = (nodeId: string) =>
  api.get<FileSystemNode>(`folders/${nodeId}/subtree`).then((r) => r.data);
