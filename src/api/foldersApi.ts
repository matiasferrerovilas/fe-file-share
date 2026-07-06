import { api } from "./axios";
import type { FileSystemNode } from "../models/FileSystemNode";

export const ROOT_FOLDER_ID = "root";

export const getFileSystemTree = () =>
  api.get<FileSystemNode>("folders/tree").then((r) => [r.data]);

export const deleteFolder = (folderId: string) =>
  api.delete<void>(`folders/${folderId}`).then((r) => r.data);

export const shareFolderWithMedicalApp = (folderId: string) =>
  api.post<void>(`folders/${folderId}/integrations/medical-app`).then((r) => r.data);

export const uploadFileToFolder = (
  folderId: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
) => {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .post<FileSystemNode>(`folders/${folderId}/files`, formData, {
      signal,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    })
    .then((r) => r.data);
};
