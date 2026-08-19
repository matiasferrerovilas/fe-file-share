import { useMutation, useQueryClient } from "@tanstack/react-query";
import { downloadFile } from "../api/foldersApi";
import { RECENT_FILES_QUERY_KEY } from "./useRecentFiles";

export const useDownloadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => downloadFile(fileId),
    onSuccess: () => {
      // El backend actualiza lastAccessedAt en cada descarga real — "Recientes" queda desactualizado
      // hasta que se invalida esta query.
      queryClient.invalidateQueries({ queryKey: RECENT_FILES_QUERY_KEY });
    },
  });
};
