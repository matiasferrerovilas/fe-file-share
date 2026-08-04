import { App as AntdApp } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveNode } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY, useFileSystemTree } from "./useFileSystemTree";
import { findNode } from "../utils/fileSystemTree";

// MIME type custom en dataTransfer para identificar el nodo arrastrado — lo usan
// tanto las cards de la grilla como el árbol lateral, sea cual sea el origen del drag.
export const MOVE_NODE_DATA_TYPE = "application/x-file-node-id";

export const useMoveNode = () => {
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();
  const { data: tree = [] } = useFileSystemTree();

  const mutation = useMutation({
    mutationFn: ({ nodeId, targetFolderId }: { nodeId: string; targetFolderId: string }) =>
      moveNode(nodeId, targetFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILE_SYSTEM_TREE_QUERY_KEY });
    },
    onError: () => {
      message.error("No se pudo mover el elemento");
    },
  });

  const moveIfValid = (draggedId: string, targetFolderId: string) => {
    if (!draggedId || draggedId === targetFolderId) return;

    const draggedNode = findNode(tree, draggedId);
    if (draggedNode?.metadata.type === "FOLDER" && findNode(draggedNode.children ?? [], targetFolderId)) {
      message.warning("No podés mover una carpeta dentro de sí misma");
      return;
    }

    mutation.mutate({ nodeId: draggedId, targetFolderId });
  };

  return { moveIfValid };
};
