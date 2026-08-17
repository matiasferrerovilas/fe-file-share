import type { TFunction } from "i18next";
import { formatFileSize } from "./formatFileSize";

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

export function getUploadRejectionReason(file: File, t: TFunction): string | null {
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
    return t("files.uploadRejectedMedia", { name: file.name });
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return t("files.uploadRejectedTooLarge", {
      name: file.name,
      maxSize: formatFileSize(MAX_UPLOAD_SIZE_BYTES),
    });
  }
  return null;
}

export function partitionUploadableFiles(
  files: File[],
  t: TFunction,
): { valid: File[]; rejectionReasons: string[] } {
  const valid: File[] = [];
  const rejectionReasons: string[] = [];

  for (const file of files) {
    const reason = getUploadRejectionReason(file, t);
    if (reason) {
      rejectionReasons.push(reason);
    } else {
      valid.push(file);
    }
  }

  return { valid, rejectionReasons };
}
