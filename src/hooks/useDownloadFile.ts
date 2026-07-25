import { useMutation } from "@tanstack/react-query";
import { downloadFile } from "../api/foldersApi";

export const useDownloadFile = () =>
  useMutation({
    mutationFn: (fileId: string) => downloadFile(fileId),
  });
