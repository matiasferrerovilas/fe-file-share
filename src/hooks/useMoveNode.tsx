import { App as AntdApp } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { moveNode, renameNode } from "../api/foldersApi";
import { FILE_SYSTEM_TREE_QUERY_KEY, useFileSystemTree } from "./useFileSystemTree";
import { findNode } from "../utils/fileSystemTree";
import { parseNameConflict, suggestAlternativeName } from "../utils/conflictResolution";

// MIME type custom en dataTransfer para identificar el nodo arrastrado — lo usan
// tanto las cards de la grilla como el árbol lateral, sea cual sea el origen del drag.
export const MOVE_NODE_DATA_TYPE = "application/x-file-node-id";

const CONFLICT_MESSAGE_KEY = "move-name-conflict";

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
  });

  // El endpoint de mover no acepta un nombre nuevo — para "usar 'X (2)'" primero se renombra en
  // el lugar (donde 'X (2)' seguramente no colisiona) y recién ahí se mueve con ese nombre.
  const retryMoveWithAlternativeName = async (nodeId: string, targetFolderId: string, alternativeName: string) => {
    try {
      await renameNode(nodeId, alternativeName);
      await mutation.mutateAsync({ nodeId, targetFolderId });
    } catch {
      message.error(t("files.moveFailed"));
    }
  };

  const moveIfValid = (draggedId: string, targetFolderId: string) => {
    if (!draggedId || draggedId === targetFolderId) return;

    const draggedNode = findNode(tree, draggedId);
    if (draggedNode?.metadata.type === "FOLDER" && findNode(draggedNode.children ?? [], targetFolderId)) {
      message.warning(t("files.moveIntoSelfError"));
      return;
    }

    mutation.mutate(
      { nodeId: draggedId, targetFolderId },
      {
        onError: (error) => {
          const conflictingName = parseNameConflict(error);
          if (!conflictingName) {
            message.error(t("files.moveFailed"));
            return;
          }

          const suggestion = suggestAlternativeName(conflictingName);
          message.error({
            key: CONFLICT_MESSAGE_KEY,
            duration: 8,
            content: (
              <span>
                {t("files.nameConflict", { name: conflictingName })}{" "}
                <a
                  onClick={() => {
                    message.destroy(CONFLICT_MESSAGE_KEY);
                    void retryMoveWithAlternativeName(draggedId, targetFolderId, suggestion);
                  }}
                >
                  {t("files.useAlternativeName", { name: suggestion })}
                </a>
              </span>
            ),
          });
        },
      },
    );
  };

  // Sin toast individual por error — usado por el movimiento masivo, que arma su propio
  // resumen ("N movidos, M fallaron") en vez de un toast genérico por cada ítem.
  return { moveIfValid, moveNodeAsync: mutation.mutateAsync, isMoving: mutation.isPending };
};
