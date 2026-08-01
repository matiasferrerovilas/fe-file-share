import { api } from "./axios";
import type { FileSystemNode } from "../models/FileSystemNode";

export const ROOT_FOLDER_ID = "root";

export const getFileSystemTree = (workspaceId: number) =>
  api.get<FileSystemNode>("folders/tree", { params: { workspaceId } }).then((r) => [r.data]);

export const deleteFolder = (folderId: string) =>
  api.delete<void>(`folders/${folderId}`).then((r) => r.data);

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
