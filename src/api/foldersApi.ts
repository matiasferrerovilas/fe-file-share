import { api } from "./axios";
import type { FolderContents } from "../models/Folder";
import type { FileItem } from "../models/FileItem";
import type { FolderTreeNode } from "../models/FolderTree";

export const ROOT_FOLDER_ID = "root";

export const getFolderContents = (folderId: string) =>
  api.get<FolderContents>(`/v1/folders/${folderId}/contents`).then((r) => r.data);

export const getFolderTree = () =>
  api.get<FolderTreeNode[]>("/v1/folders/tree").then((r) => r.data);

export const deleteFolder = (folderId: string) =>
  api.delete<void>(`/v1/folders/${folderId}`).then((r) => r.data);

export const shareFolderWithMedicalApp = (folderId: string) =>
  api.post<void>(`/v1/folders/${folderId}/integrations/medical-app`).then((r) => r.data);

export const uploadFileToFolder = (
  folderId: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post<FileItem>(`/v1/folders/${folderId}/files`, formData, {
      signal,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    })
    .then((r) => r.data);
};
