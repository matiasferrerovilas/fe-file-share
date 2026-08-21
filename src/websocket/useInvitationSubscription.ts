import { useEffect, useLayoutEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import type { Invitations } from "../models/Workspace";
import { useCurrentUser } from "../hooks/useCurrentUser";

const INVITATIONS_QUERY_KEY = "workspace-invitations" as const;

/**
 * api-keep publica invitaciones nuevas en /topic/invitations/{email}/new (ver
 * WebSocketTopics.invitationsNew) — sin esto, una invitación recién enviada no aparece hasta
 * que el usuario recarga la página.
 */
export const useInvitationSubscription = () => {
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: currentUser } = useCurrentUser();
  const userEmail = currentUser?.email;

  // callbackRef evita stale closures: siempre lee los valores más recientes
  const callbackRef = useRef<((event: EventWrapper<Invitations>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event: EventWrapper<Invitations>) => {
      if (event.eventType !== EventType.INVITATION_ADDED) return;

      const payload = event.message;
      if (payload.invitedByEmail === userEmail) return;

      const queries = queryClient.getQueriesData<Invitations[]>({
        queryKey: [INVITATIONS_QUERY_KEY],
        exact: false,
      });

      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;

        queryClient.setQueryData(queryKey, (old?: Invitations[]) => {
          if (!old) return old;
          if (old.some((inv) => inv.id === payload.id)) return old;
          return [...old, payload];
        });
      });
    };
  });

  useEffect(() => {
    if (!ws.isConnected || !userEmail) return;

    const callback = (event: EventWrapper<Invitations>) => callbackRef.current!(event);
    const topic = `/topic/invitations/${userEmail}/new`;

    ws.subscribe(topic, callback);

    return () => {
      ws.unsubscribe(topic, callback);
    };
  }, [ws, ws.isConnected, userEmail]);

  return null;
};
