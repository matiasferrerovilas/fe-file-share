import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { api, LARGE_FILE_TIMEOUT_MS } from "../api/axios";

const fetchFileBlob = async (fileId: string): Promise<Blob> => {
  const response = await api.get<Blob>(`folders/${fileId}/download`, {
    responseType: "blob",
    timeout: LARGE_FILE_TIMEOUT_MS,
  });
  return response.data;
};

interface UseFilePreviewResult {
  url: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches the file as a blob (same GET .../download endpoint the download button uses) and
 * exposes it as an object URL for inline rendering. The URL is derived from the query's blob data
 * rather than tracked in its own state, so there's no setState-during-effect involved; the effect
 * only revokes the previous URL once a new one replaces it (or the hook unmounts).
 */
export function useFilePreview(fileId: string | null): UseFilePreviewResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["file-preview", fileId],
    queryFn: () => fetchFileBlob(fileId!),
    enabled: fileId !== null,
    gcTime: 0,
  });

  const url = useMemo(() => (data ? URL.createObjectURL(data) : null), [data]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return {
    url,
    loading: fileId !== null && isLoading,
    error: fileId !== null && isError,
  };
}
