import { api } from "./axios";
import type { FileSystemNode } from "../models/FileSystemNode";
import { MOCK_FILE_SYSTEM_TREE } from "./mocks/fileSystemTreeMock";

export const ROOT_FOLDER_ID = "root";

// TODO: mock temporal para probar el explorador visualmente sin backend — sacar cuando /v1/folders/tree exista de verdad.
const USE_MOCK_TREE = true;

export const getFileSystemTree = () =>
  USE_MOCK_TREE
    ? Promise.resolve(MOCK_FILE_SYSTEM_TREE)
    : api.get<FileSystemNode[]>("/v1/folders/tree").then((r) => r.data);

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
    .post<FileSystemNode>(`/v1/folders/${folderId}/files`, formData, {
      signal,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    })
    .then((r) => r.data);
};
