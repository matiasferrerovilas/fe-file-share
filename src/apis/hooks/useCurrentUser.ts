import { useQuery } from "@tanstack/react-query";
import { useKeycloak } from "@react-keycloak/web";
import { api } from "../axios"; 
import type { CurrentUser } from "../../models/CurrentUser";

export const CURRENT_USER_QUERY_KEY = ["current-user"] as const;

export const useCurrentUser = () => {
  const { keycloak } = useKeycloak();

  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => api.get<CurrentUser>("/users/me").then((r) => r.data),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!keycloak.authenticated,
  });
};
