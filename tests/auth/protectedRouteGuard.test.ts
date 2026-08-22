import { describe, it, expect } from "vitest";
import { protectedRouteGuard } from "../../src/auth/protectedRouteGuard";
import type { RootRouteContext } from "../../src/routes/__root";

const makeContext = (
  overrides: Partial<RootRouteContext["auth"]> & {
    roles?: string[];
  } = {},
): RootRouteContext => {
  const { roles, ...authOverrides } = overrides;
  return {
    auth: {
      authenticated: true,
      loading: false,
      firstLogin: false,
      keycloak: {
        tokenParsed: { realm_access: { roles: roles ?? [] } },
      } as unknown as RootRouteContext["auth"]["keycloak"],
      ...authOverrides,
    },
  } as RootRouteContext;
};

describe("protectedRouteGuard", () => {
  it("no hace nada mientras auth está cargando", async () => {
    const guard = protectedRouteGuard();
    await expect(guard({ context: makeContext({ loading: true }) })).resolves.toBeUndefined();
  });

  it("redirige a '/onboarding' cuando es el primer login", async () => {
    const guard = protectedRouteGuard();
    await expect(guard({ context: makeContext({ firstLogin: true }) })).rejects.toMatchObject({
      options: { to: "/onboarding" },
    });
  });

  it("permite el paso cuando no se requieren roles", async () => {
    const guard = protectedRouteGuard();
    await expect(guard({ context: makeContext() })).resolves.toBeUndefined();
  });

  it("permite el paso cuando el usuario tiene un rol requerido con prefijo ROLE_", async () => {
    const guard = protectedRouteGuard({ roles: ["ADMIN"] });
    await expect(
      guard({ context: makeContext({ roles: ["ROLE_ADMIN"] }) }),
    ).resolves.toBeUndefined();
  });

  it("permite el paso cuando el usuario tiene el rol sin prefijo", async () => {
    const guard = protectedRouteGuard({ roles: ["ADMIN"] });
    await expect(guard({ context: makeContext({ roles: ["ADMIN"] }) })).resolves.toBeUndefined();
  });

  it("redirige a '/403' cuando el usuario no tiene ninguno de los roles requeridos", async () => {
    const guard = protectedRouteGuard({ roles: ["ADMIN"] });
    await expect(guard({ context: makeContext({ roles: ["GUEST"] }) })).rejects.toMatchObject({
      options: { to: "/403" },
    });
  });

  it("redirige a un 'redirectTo' custom cuando se especifica", async () => {
    const guard = protectedRouteGuard({ roles: ["ADMIN"], redirectTo: "/no-autorizado" });
    await expect(guard({ context: makeContext({ roles: [] }) })).rejects.toMatchObject({
      options: { to: "/no-autorizado" },
    });
  });
});
