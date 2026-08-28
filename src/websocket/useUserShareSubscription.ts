import { useEffect, useLayoutEffect, useRef } from "react";
import { App as AntdApp } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "./WebSocketProvider";
import { EventType, type EventWrapper } from "./EventWrapper";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { SHARED_WITH_ME_QUERY_KEY } from "../hooks/useSharedWithMe";

interface UserFileShareEventPayload {
  shareId: string;
  fileId: string;
  fileName: string;
  sharedWithEmail: string;
  sharedByEmail: string | null;
  permission: string;
  expiresAt: string | null;
}

/**
 * api-keep publica en /topic/shares/users/{email}/new tanto cuando alguien te comparte algo
 * (USER_FILE_SHARED) como cuando un share que tenés está por vencer (USER_FILE_SHARE_EXPIRING) —
 * sin esto, ninguno de los dos se notaba hasta entrar a "Compartido conmigo" y mirar.
 */
export const useUserShareSubscription = () => {
  const { t } = useTranslation();
  const { notification } = AntdApp.useApp();
  const queryClient = useQueryClient();
  const ws = useWebSocket();
  const { data: currentUser } = useCurrentUser();
  const userEmail = currentUser?.email;

  // callbackRef evita stale closures: siempre lee los valores más recientes (mismo patrón que
  // useInvitationSubscription).
  const callbackRef = useRef<((event: EventWrapper<UserFileShareEventPayload>) => void) | null>(null);
  useLayoutEffect(() => {
    callbackRef.current = (event) => {
      const payload = event.message;

      if (event.eventType === EventType.USER_FILE_SHARED) {
        notification.info({
          message: t("files.sharedWithMe.newShareTitle"),
          description: payload.sharedByEmail
            ? t("files.sharedWithMe.newShareDescription", { fileName: payload.fileName, email: payload.sharedByEmail })
            : t("files.sharedWithMe.newShareDescriptionNoSender", { fileName: payload.fileName }),
        });
      } else if (event.eventType === EventType.USER_FILE_SHARE_EXPIRING) {
        notification.warning({
          message: t("files.sharedWithMe.expiringTitle"),
          description: t("files.sharedWithMe.expiringDescription", { fileName: payload.fileName }),
        });
      } else {
        return;
      }

      queryClient.invalidateQueries({ queryKey: SHARED_WITH_ME_QUERY_KEY });
    };
  });

  useEffect(() => {
    if (!ws.isConnected || !userEmail) return;

    const callback = (event: EventWrapper<UserFileShareEventPayload>) => callbackRef.current!(event);
    const topic = `/topic/shares/users/${userEmail}/new`;

    ws.subscribe(topic, callback);

    return () => {
      ws.unsubscribe(topic, callback);
    };
  }, [ws, ws.isConnected, userEmail]);

  return null;
};
