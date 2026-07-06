import { useQuery } from "@tanstack/react-query";
import { getFolderContents } from "../api/foldersApi";

export const folderContentsQueryKey = (folderId: string) =>
  ["folder-contents", folderId] as const;

export const useFolderContents = (folderId: string) =>
  useQuery({
    queryKey: folderContentsQueryKey(folderId),
    queryFn: () => getFolderContents(folderId),
  });
