import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket, type EventCallback } from "./WebSocketProvider";
import { useCurrentWorkspace } from "../workspace/WorkspaceContext";
import { FILE_SYSTEM_TREE_QUERY_KEY } from "../hooks/useFileSystemTree";
import { WORKSPACE_USAGE_QUERY_KEY } from "../hooks/useWorkspaceUsage";

// El backend publica en /topic/files/{workspaceId}/{new|update|delete}. Antes nada se
// suscribía a esto pese a que WebSocketProvider ya conecta y autentica — cualquier cambio
// hecho desde otra sesión (u otro dispositivo) requería un refetch manual del árbol.
const topicsFor = (workspaceId: number) => [
  `/topic/files/${workspaceId}/new`,
  `/topic/files/${workspaceId}/update`,
  `/topic/files/${workspaceId}/delete`,
];

export const useFileTreeRealtimeSync = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.workspaceId;
  const { subscribe, unsubscribe } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (workspaceId === undefined) {
      return;
    }

    const invalidateTree: EventCallback = () => {
      queryClient.invalidateQueries({ queryKey: [...FILE_SYSTEM_TREE_QUERY_KEY, workspaceId] });
      queryClient.invalidateQueries({ queryKey: [...WORKSPACE_USAGE_QUERY_KEY, workspaceId] });
    };

    const topics = topicsFor(workspaceId);
    topics.forEach((topic) => subscribe(topic, invalidateTree));

    return () => {
      topics.forEach((topic) => unsubscribe(topic, invalidateTree));
    };
  }, [workspaceId, subscribe, unsubscribe, queryClient]);
};
