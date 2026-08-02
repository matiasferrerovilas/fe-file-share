import { formatFileSize } from "./formatFileSize";

export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;

export function getUploadRejectionReason(file: File): string | null {
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
    return `"${file.name}": no se permiten imágenes ni videos`;
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return `"${file.name}": supera el tamaño máximo de ${formatFileSize(MAX_UPLOAD_SIZE_BYTES)}`;
  }
  return null;
}

export function partitionUploadableFiles(files: File[]): { valid: File[]; rejectionReasons: string[] } {
  const valid: File[] = [];
  const rejectionReasons: string[] = [];

  for (const file of files) {
    const reason = getUploadRejectionReason(file);
    if (reason) {
      rejectionReasons.push(reason);
    } else {
      valid.push(file);
    }
  }

  return { valid, rejectionReasons };
}
