import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import { useWorkspaces, USER_WORKSPACES_QUERY_KEY } from "../hooks/useWorkspaces";
import { useCurrentUser } from "../hooks/useCurrentUser";

/**
 * api-keep publica en /topic/workspace/{workspaceId}/members/update cuando alguien acepta una
 * invitación (ver InvitationPublishServiceWebSocket) y en /topic/membership/{email}/remove
 * cuando te sacan de un workspace (ver WorkspaceMembershipPublishServiceWebSocket). Ninguno de
 * los dos payloads trae el Workspace completo, así que en vez de mergear a mano invalidamos
 * para refetchear la lista con los miembros/workspaces al día.
 */
export const useWorkspacesSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: memberships = [] } = useWorkspaces();
  const { data: currentUser } = useCurrentUser();
  const userEmail = currentUser?.email;

  const membersUpdateTopics = useMemo(
    () => memberships.map((m) => `/topic/workspace/${m.workspaceId}/members/update`),
    [memberships],
  );

  const callbackRef = useRef((event: EventWrapper<unknown>) => {
    switch (event.eventType) {
      case EventType.MEMBERSHIP_UPDATED:
      case EventType.WORKSPACE_LEFT:
        queryClient.invalidateQueries({ queryKey: USER_WORKSPACES_QUERY_KEY });
        break;
      default:
        break;
    }
  });

  useEffect(() => {
    if (!ws.isConnected || !userEmail) return;

    const callback = callbackRef.current;
    const topics = [`/topic/membership/${userEmail}/remove`, ...membersUpdateTopics];

    topics.forEach((t) => ws.subscribe(t, callback));
    return () => topics.forEach((t) => ws.unsubscribe(t, callback));
  }, [ws, ws.isConnected, userEmail, membersUpdateTopics]);

  return null;
};
