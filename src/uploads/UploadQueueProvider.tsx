import { useCallback, useRef, useState, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { App as AntdApp } from "antd";
import { useUploadFileToFolder } from "../hooks/useUploadFileToFolder";
import { uploadSemaphore } from "../utils/uploadSemaphore";
import { partitionUploadableFiles } from "../utils/uploadValidation";
import { parseChecksumConflict, parseNameConflict } from "../utils/conflictResolution";
import { UploadQueueContext, type UploadQueueItem } from "./UploadQueueContext";

// Cuánto queda visible en la bandeja una subida ya terminada (o fallida) antes de
// sacarla sola — da tiempo a leer el resultado sin que el usuario tenga que cerrarla.
const COMPLETED_ITEM_TTL_MS = 3000;

/**
 * Turns a failed upload into a specific, per-file reason instead of leaving the item's failure
 * unexplained — a name collision and a checksum duplicate are both "it failed", but they mean
 * different things and point to different fixes (rename vs. it's already there).
 */
function describeUploadError(error: unknown, t: TFunction): string {
  const nameConflict = parseNameConflict(error);
  if (nameConflict) return t("files.nameConflict", { name: nameConflict });

  const checksumConflict = parseChecksumConflict(error);
  if (checksumConflict) return t("files.checksumConflict", { name: checksumConflict });

  return t("files.uploadItemFailed");
}

/**
 * Punto único de subida: antes esta lógica (validación, semáforo, agregación de
 * resultados) estaba duplicada en PageDropzone/FolderTreeSidebar/FolderContentsPanel,
 * cada uno con su propio `onProgress: () => {}` que tiraba el dato al piso. Centralizarla
 * acá permite que la bandeja de progreso (UploadProgressTray) vea todas las subidas sin
 * importar desde qué punto de entrada se dispararon.
 */
export function UploadQueueProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
  const { mutateAsync: uploadFile } = useUploadFileToFolder();
  const { message } = AntdApp.useApp();
  const idCounter = useRef(0);

  const updateItem = useCallback((id: string, patch: Partial<UploadQueueItem>) => {
    setUploads((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const runUploads = useCallback(
    async (folderId: string, fileList: FileList | File[] | null, t: TFunction) => {
      const selected = Array.from(fileList ?? []);
      if (selected.length === 0) return;

      const { valid: files, rejectionReasons } = partitionUploadableFiles(selected, t);
      rejectionReasons.forEach((reason) => message.error(reason));
      if (files.length === 0) return;

      const results = await Promise.allSettled(
        files.map(async (file) => {
          const id = `upload-${idCounter.current++}`;
          setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "uploading" }]);

          const release = await uploadSemaphore.acquire();
          try {
            await uploadFile({
              folderId,
              file,
              onProgress: (percent) => updateItem(id, { progress: percent }),
            });
            updateItem(id, { progress: 100, status: "done" });
          } catch (error) {
            updateItem(id, { status: "error", errorMessage: describeUploadError(error, t) });
            throw error;
          } finally {
            release();
            setTimeout(() => removeItem(id), COMPLETED_ITEM_TTL_MS);
          }
        }),
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        message.error(t("files.uploadFailedCount", { failed, total: files.length }));
      } else {
        message.success(
          files.length === 1 ? t("files.uploadSuccess") : t("files.uploadSuccessMultiple", { count: files.length }),
        );
      }
    },
    [uploadFile, message, updateItem, removeItem],
  );

  return (
    <UploadQueueContext.Provider value={{ uploads, runUploads }}>{children}</UploadQueueContext.Provider>
  );
}
