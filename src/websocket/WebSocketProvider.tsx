/* eslint-disable react-refresh/only-export-components */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useKeycloak } from "@react-keycloak/web";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventCallback<T = any> = (payload: T) => void;

interface WebSocketContextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe: <T = any>(topic: string, callback: EventCallback<T>) => void;
  unsubscribe: (topic: string, callback: EventCallback) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<EventCallback>>>(new Map());
  const activeSubscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());
  const { keycloak, initialized } = useKeycloak();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // CRÍTICO: Espera a que Keycloak esté inicializado y autenticado
    if (!initialized || !keycloak.authenticated) {
      return;
    }

    const baseUrl = window.env.backend.websocketUrl;

    if (!baseUrl) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      beforeConnect: async () => {
        // Refresca el token si está por vencer, sin recrear la conexión entera.
        try {
          await keycloak.updateToken(30);
        } catch {
          // no se pudo renovar — se intenta igual con el token vigente
        }
        client.connectHeaders = { Authorization: `Bearer ${keycloak.token}` };
      },
      onConnect: () => {
        setIsConnected(true);

        subscriptionsRef.current.forEach((callbacks, topic) => {
          const subscription = client.subscribe(topic, (message) => {
            try {
              const payload = JSON.parse(message.body) as unknown;
              callbacks.forEach((cb) => cb(payload));
            } catch {
              // mensaje malformado — ignorar silenciosamente
            }
          });
          activeSubscriptionsRef.current.set(topic, subscription);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        activeSubscriptionsRef.current.clear();
      },
      onStompError: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    const activeSubscriptionsSnapshot = activeSubscriptionsRef.current;

    return () => {
      console.debug("🧹 Limpiando WebSocket...");
      if (client.active) {
        client.deactivate();
      }
      clientRef.current = null;
      activeSubscriptionsSnapshot.clear();
      setIsConnected(false);
    };
    // keycloak es una instancia estable (no cambia de referencia en cada refresh de
    // token), así que este efecto solo corre en login/logout real, no en cada renovación.
  }, [keycloak, keycloak.authenticated, initialized]);

  const subscribe = useCallback(<T,>(topic: string, callback: EventCallback<T>) => {
    if (!subscriptionsRef.current.has(topic)) {
      subscriptionsRef.current.set(topic, new Set());
    }
    subscriptionsRef.current.get(topic)!.add(callback);

    if (clientRef.current?.connected && !activeSubscriptionsRef.current.has(topic)) {
      try {
        const subscription = clientRef.current.subscribe(topic, (message) => {
          try {
            const payload = JSON.parse(message.body) as unknown;
            subscriptionsRef.current.get(topic)?.forEach((cb) => cb(payload));
          } catch {
            // mensaje malformado — ignorar
          }
        });
        activeSubscriptionsRef.current.set(topic, subscription);
      } catch {
        // error al suscribir — se reintentará en onConnect
      }
    }
  }, []);

  const unsubscribe = useCallback((topic: string, callback: EventCallback) => {
    const callbacks = subscriptionsRef.current.get(topic);
    if (callbacks) {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        subscriptionsRef.current.delete(topic);

        const subscription = activeSubscriptionsRef.current.get(topic);
        if (subscription) {
          try {
            subscription.unsubscribe();
            activeSubscriptionsRef.current.delete(topic);
          } catch {
            // ignorar error al desuscribir
          }
        }
      }
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
};
