import { useUserShareSubscription } from "./useUserShareSubscription";

// Componente sin render: solo mantiene viva la suscripción WS de shares de usuario (creados o
// por vencer) mientras esté montado — mismo patrón que FileTreeRealtimeSync, montado globalmente
// (no solo en la pantalla de Configuración) porque un share puede llegar en cualquier momento.
export const UserShareRealtimeSync = () => {
  useUserShareSubscription();
  return null;
};
