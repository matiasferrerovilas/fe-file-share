import { useQuery } from "@tanstack/react-query";
import { getFolderTree } from "../api/foldersApi";

export const FOLDER_TREE_QUERY_KEY = ["folder-tree"] as const;

export const useFolderTree = () =>
  useQuery({
    queryKey: FOLDER_TREE_QUERY_KEY,
    queryFn: getFolderTree,
  });
