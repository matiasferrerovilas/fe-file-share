import { createContext, useContext } from "react";
import type { TFunction } from "i18next";

export interface UploadQueueItem {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "done" | "error";
  // Solo presente cuando status es "error" — por qué falló específicamente este archivo (nombre
  // repetido, contenido duplicado, o un mensaje genérico si no matchea ningún conflicto conocido),
  // no solo un conteo agregado de la subida en lote.
  errorMessage?: string;
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
