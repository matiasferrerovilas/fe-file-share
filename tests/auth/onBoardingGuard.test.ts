import { describe, it, expect } from "vitest";
import { onBoardingGuard } from "../../src/auth/onBoardingGuard";
import type { RootRouteContext } from "../../src/routes/__root";

const makeContext = (overrides: Partial<RootRouteContext["auth"]>): RootRouteContext =>
  ({
    auth: {
      authenticated: true,
      loading: false,
      firstLogin: false,
      keycloak: {} as RootRouteContext["auth"]["keycloak"],
      ...overrides,
    },
  }) as RootRouteContext;

describe("onBoardingGuard", () => {
  it("no hace nada mientras auth está cargando", async () => {
    await expect(
      onBoardingGuard({ context: makeContext({ loading: true, firstLogin: true }) }),
    ).resolves.toBeUndefined();
  });

  it("redirige a '/' cuando el usuario ya completó el onboarding", async () => {
    await expect(
      onBoardingGuard({ context: makeContext({ firstLogin: false }) }),
    ).rejects.toMatchObject({ options: { to: "/" } });
  });

  it("no redirige cuando el usuario está en su primer login", async () => {
    await expect(
      onBoardingGuard({ context: makeContext({ firstLogin: true }) }),
    ).resolves.toBeUndefined();
  });
});
