import { redirect } from "@tanstack/react-router";
import type { RootRouteContext } from "../../routes/__root";

type ProtectedRouteGuardOptions = {
  roles?: string[];
  redirectTo?: string;
};

export const protectedRouteGuard = (options?: ProtectedRouteGuardOptions) => {
  return async ({ context }: { context: RootRouteContext }) => {
    const { auth } = context;
    if (auth.loading) return;

    if (auth.firstLogin) {
      throw redirect({ to: "/onboarding" });
    }

    if (options?.roles && options.roles.length > 0) {
      const userRoles = auth?.keycloak?.tokenParsed?.realm_access?.roles || [];

      const hasRequiredRole = options.roles.some((role) => {
        return userRoles.includes(`ROLE_${role}`) || userRoles.includes(role);
      });

      if (!hasRequiredRole) {
        throw redirect({ to: options.redirectTo || "/" });
      }
    }
  };
};
