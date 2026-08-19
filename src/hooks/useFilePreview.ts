import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { api, LARGE_FILE_TIMEOUT_MS } from "../api/axios";
import { RECENT_FILES_QUERY_KEY } from "./useRecentFiles";

const fetchFileBlob = async (fileId: string): Promise<Blob> => {
  const response = await api.get<Blob>(`folders/${fileId}/download`, {
    responseType: "blob",
    timeout: LARGE_FILE_TIMEOUT_MS,
  });
  return response.data;
};

interface UseFilePreviewOptions {
  // Plain-text/Markdown previews need the raw text, not an object URL — reading the blob as text
  // is opt-in so image/PDF previews (the common case) never pay for it.
  asText?: boolean;
}

interface UseFilePreviewResult {
  url: string | null;
  text: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches the file as a blob (same GET .../download endpoint the download button uses) and
 * exposes it as an object URL for inline rendering. The URL is derived from the query's blob data
 * rather than tracked in its own state, so there's no setState-during-effect involved; the effect
 * only revokes the previous URL once a new one replaces it (or the hook unmounts).
 */
export function useFilePreview(fileId: string | null, options?: UseFilePreviewOptions): UseFilePreviewResult {
  const queryClient = useQueryClient();
  const asText = options?.asText ?? false;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["file-preview", fileId],
    // La vista previa usa el mismo endpoint de descarga que "Recientes" usa para saber qué se
    // abrió de verdad — el backend actualiza lastAccessedAt acá también.
    queryFn: () => fetchFileBlob(fileId!).then((blob) => {
      queryClient.invalidateQueries({ queryKey: RECENT_FILES_QUERY_KEY });
      return blob;
    }),
    enabled: fileId !== null,
    gcTime: 0,
  });

  const url = useMemo(() => (data && !asText ? URL.createObjectURL(data) : null), [data, asText]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  // fileId (y por lo tanto `data`) es estable durante la vida de una instancia de este hook —
  // cada FilePreviewModal se monta para un único archivo (destroyOnHidden), así que no hace falta
  // resetear `text` sincrónicamente al reingresar al efecto; el estado inicial ya es null.
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!asText || !data) return;

    let cancelled = false;
    data.text().then((value) => {
      if (!cancelled) setText(value);
    });
    return () => {
      cancelled = true;
    };
  }, [data, asText]);

  return {
    url,
    text,
    loading: fileId !== null && (isLoading || (asText && text === null)),
    error: fileId !== null && isError,
  };
}
