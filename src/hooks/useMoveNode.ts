import { App as AntdApp } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { moveNode } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY, useFileSystemTree } from "./useFileSystemTree";
import { findNode } from "../utils/fileSystemTree";

// MIME type custom en dataTransfer para identificar el nodo arrastrado — lo usan
// tanto las cards de la grilla como el árbol lateral, sea cual sea el origen del drag.
export const MOVE_NODE_DATA_TYPE = "application/x-file-node-id";

export const useMoveNode = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  const { data: tree = [] } = useFileSystemTree();

  const mutation = useMutation({
    mutationFn: ({ nodeId, targetFolderId }: { nodeId: string; targetFolderId: string }) =>
      moveNode(nodeId, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
    onError: () => {
      message.error(t("files.moveFailed"));
    },
  });

  const moveIfValid = (draggedId: string, targetFolderId: string) => {
    if (!draggedId || draggedId === targetFolderId) return;

    const draggedNode = findNode(tree, draggedId);
    if (draggedNode?.metadata.type === "FOLDER" && findNode(draggedNode.children ?? [], targetFolderId)) {
      message.warning(t("files.moveIntoSelfError"));
      return;
    }

    mutation.mutate({ nodeId: draggedId, targetFolderId });
  };

  return { moveIfValid };
};
