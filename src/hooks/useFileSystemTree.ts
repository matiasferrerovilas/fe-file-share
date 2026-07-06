import { useQuery } from "@tanstack/react-query";
import { getFileSystemTree } from "../api/foldersApi";

export const FILE_SYSTEM_TREE_QUERY_KEY = ["file-system-tree"] as const;

export const useFileSystemTree = () =>
  useQuery({
    queryKey: FILE_SYSTEM_TREE_QUERY_KEY,
    queryFn: getFileSystemTree,
  });
