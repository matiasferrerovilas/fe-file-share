import { useKeycloak } from "@react-keycloak/web";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { keycloak, initialized } = useKeycloak();

  // Derivamos el estado directamente de Keycloak en lugar de sincronizarlo con useEffect+setState
  const state = {
    authenticated: initialized ? (keycloak.authenticated ?? false) : false,
    loading: !initialized,
  };

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}
