import { createContext, useContext } from "react";
import type { TFunction } from "i18next";

export interface UploadQueueItem {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

export interface UploadQueueContextValue {
  uploads: UploadQueueItem[];
  runUploads: (folderId: string, fileList: FileList | File[] | null, t: TFunction) => Promise<void>;
}

export const UploadQueueContext = createContext<UploadQueueContextValue | null>(null);

export function useUploadQueue(): UploadQueueContextValue {
  const ctx = useContext(UploadQueueContext);
  if (!ctx) throw new Error("useUploadQueue must be used inside an UploadQueueProvider");
  return ctx;
}
