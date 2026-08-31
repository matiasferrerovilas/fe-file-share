import { api, LARGE_FILE_TIMEOUT_MS } from "./axios";
import type { FileActivity } from "../models/FileActivity";
import type { FileSystemNode } from "../models/FileSystemNode";
import type { FileSearchResult } from "../models/FileSearchResult";
import type { WorkspaceUsage } from "../models/WorkspaceUsage";

export const ROOT_FOLDER_ID = "root";

export const getFileSystemTree = (workspaceId: number) =>
  api.get<FileSystemNode>("folders/tree", { params: { workspaceId } }).then((r) => [r.data]);

export const getWorkspaceUsage = (workspaceId: number) =>
  api.get<WorkspaceUsage>("folders/usage", { params: { workspaceId } }).then((r) => r.data);

export const searchFiles = (workspaceId: number, query: string) =>
  api.get<FileSearchResult[]>("folders/search", { params: { workspaceId, query } }).then((r) => r.data);

export const setFavorite = (nodeId: string, favorite: boolean) =>
  api.patch<FileSystemNode>(`folders/${nodeId}/favorite`, { favorite }).then((r) => r.data);

export const setFolderCustomization = (nodeId: string, color: string | null, icon: string | null) =>
  api.patch<FileSystemNode>(`folders/${nodeId}/customization`, { color, icon }).then((r) => r.data);

export const getFileActivity = (nodeId: string) =>
  api.get<FileActivity[]>(`folders/${nodeId}/activity`).then((r) => r.data);

export const getFavorites = (workspaceId: number) =>
  api.get<FileSystemNode[]>("folders/favorites", { params: { workspaceId } }).then((r) => r.data);

export const getRecentFiles = (workspaceId: number, limit?: number) =>
  api.get<FileSystemNode[]>("folders/recent", { params: { workspaceId, limit } }).then((r) => r.data);

export const getTrash = (workspaceId: number) =>
  api.get<FileSystemNode[]>("folders/trash", { params: { workspaceId } }).then((r) => r.data);

export const restoreNode = (nodeId: string) =>
  api.post<FileSystemNode>(`folders/${nodeId}/restore`).then((r) => r.data);

// Soft-delete: el nodo queda en la papelera y se purga automáticamente al día siguiente si no
// se restaura antes (ver getTrash/restoreNode/purgeNode).
export const deleteFolder = (folderId: string) =>
  api.delete<void>(`folders/${folderId}`).then((r) => r.data);

// Borra permanentemente un nodo que ya está en la papelera, sin esperar al barrido automático.
export const purgeNode = (nodeId: string) =>
  api.delete<void>(`folders/${nodeId}/purge`).then((r) => r.data);

export const createFolder = (workspaceId: number, folderId: string, name: string) =>
  api
    .post<FileSystemNode>("folders", {
      workspaceId,
      parentId: folderId === ROOT_FOLDER_ID ? undefined : folderId,
      name,
    })
    .then((r) => r.data);

export const renameNode = (nodeId: string, name: string) =>
  api.patch<FileSystemNode>(`folders/${nodeId}`, { name }).then((r) => r.data);

export const moveNode = (nodeId: string, targetFolderId: string) =>
  api
    .patch<FileSystemNode>(`folders/${nodeId}/move`, {
      parentId: targetFolderId === ROOT_FOLDER_ID ? null : Number(targetFolderId),
    })
    .then((r) => r.data);

export const uploadFileToFolder = (
  workspaceId: number,
  folderId: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post<FileSystemNode>("folders/upload", formData, {
      params: {
        workspaceId,
        parentId: folderId === ROOT_FOLDER_ID ? undefined : folderId,
      },
      headers: { "Content-Type": undefined },
      signal,
      timeout: LARGE_FILE_TIMEOUT_MS,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    })
    .then((r) => r.data);
};

export const downloadFile = async (fileId: string) => {
  const response = await api.get<Blob>(`folders/${fileId}/download`, {
    responseType: "blob",
    timeout: LARGE_FILE_TIMEOUT_MS,
  });

  const contentDisposition = response.headers["content-disposition"] as string | undefined;
  const filename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1] ?? fileId;

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
