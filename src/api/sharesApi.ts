import { api } from "./axios";
import type { FileShare, SharePermission } from "../models/FileShare";

export const shareFile = (fileId: string, apiName: string, permission: SharePermission) =>
  api.post<FileShare>("shares", { fileId, apiName, permission }).then((r) => r.data);

export const getShares = (fileId: string) =>
  api.get<FileShare[]>("shares", { params: { fileId } }).then((r) => r.data);
