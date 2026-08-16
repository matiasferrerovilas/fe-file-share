import { useFileTreeRealtimeSync } from "./useFileTreeRealtimeSync";

// Componente sin render: solo mantiene viva la suscripción WS del árbol de archivos
// mientras esté montado dentro de WorkspaceProvider + WebSocketProvider.
export const FileTreeRealtimeSync = () => {
  useFileTreeRealtimeSync();
  return null;
};
