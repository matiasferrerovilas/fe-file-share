import axios, { type AxiosError } from "axios";

interface ApiErrorResponse {
  statusCode: string;
  title: string;
  detail: string;
}

// Rename, move, upload and create-folder all reject a name collision with this exact message
// shape from the backend (see FileController/ErrorHandler) — "Ya existe un archivo con el
// nombre 'X' en ese destino".
const CONFLICT_MESSAGE_PATTERN = /Ya existe un archivo con el nombre '([^']+)' en ese destino/;

/**
 * Extracts the conflicting name from a 400 name-collision error response. Returns `null` for any
 * other error (wrong status, unrelated 400, network error, ...) so callers can fall back to their
 * existing generic-error handling instead of misreading an unrelated failure as a conflict.
 */
export function parseNameConflict(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.response?.status !== 400) return null;

  const detail = axiosError.response.data?.detail;
  if (!detail) return null;

  const match = detail.match(CONFLICT_MESSAGE_PATTERN);
  return match ? match[1] : null;
}

// Uploading a file whose content (checksum) already exists somewhere in the workspace rejects
// with this exact message shape (see FileService#uploadFile) — "El contenido ya existe en este
// workspace como 'X'". Distinct from CONFLICT_MESSAGE_PATTERN: same status-adjacent shape (a 409,
// not a 400) but a different reason — same name is allowed, identical content isn't.
const CHECKSUM_CONFLICT_MESSAGE_PATTERN = /El contenido ya existe en este workspace como '([^']+)'/;

/**
 * Extracts the existing file's name from a 409 checksum-duplicate error response — the upload
 * counterpart to {@link parseNameConflict}. Returns `null` for anything else, same reasoning.
 */
export function parseChecksumConflict(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.response?.status !== 409) return null;

  const detail = axiosError.response.data?.detail;
  if (!detail) return null;

  const match = detail.match(CHECKSUM_CONFLICT_MESSAGE_PATTERN);
  return match ? match[1] : null;
}

/**
 * Suggests a non-colliding alternative: appends " (2)" before the extension (if any), or
 * increments an existing trailing " (N)" — the same convention desktop file managers use.
 */
export function suggestAlternativeName(originalName: string): string {
  const extensionMatch = originalName.match(/^(.*?)(\.[^./\\]+)?$/);
  const base = extensionMatch?.[1] ?? originalName;
  const extension = extensionMatch?.[2] ?? "";

  const numberedMatch = base.match(/^(.*) \((\d+)\)$/);
  if (numberedMatch) {
    const nextNumber = Number(numberedMatch[2]) + 1;
    return `${numberedMatch[1]} (${nextNumber})${extension}`;
  }

  return `${base} (2)${extension}`;
}
