// hooks/useUserRoles.ts
import { useKeycloak } from "@react-keycloak/web";

export const useUserRoles = () => {
  const { keycloak } = useKeycloak();

  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];

  const hasRole = (role: string) => {
    return roles.includes(`ROLE_${role}`) || roles.includes(role);
  };

  const hasAnyRole = (...rolesToCheck: string[]) => {
    return rolesToCheck.some((role) => hasRole(role));
  };

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole("ADMIN"),
    isFamily: hasRole("FAMILY"),
    isGuest: hasRole("GUEST"),
  };
};
