import { useMutation } from "@tanstack/react-query";
import { shareFolderWithMedicalApp } from "../api/foldersApi";

export const useShareFolderWithMedicalApp = () =>
  useMutation({
    mutationFn: (folderId: string) => shareFolderWithMedicalApp(folderId),
  });
