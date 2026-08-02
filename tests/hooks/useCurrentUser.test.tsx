import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useCurrentUser } from "../../src/hooks/useCurrentUser";

const server = setupServer(
  http.get("http://localhost:8080/users/me", () =>
    HttpResponse.json({
      id: 1,
      email: "matigfv@gmail.com",
      givenName: "Matias",
      familyName: "Ferrero Vilas",
      userType: "ADMIN",
      metadata: { isFirstLogin: false, hasSeenTour: true, userRole: ["ADMIN"] },
    }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useCurrentUser", () => {
  it("no ejecuta el fetch cuando el usuario no está autenticado", () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: false },
    } as unknown as ReturnType<typeof useKeycloak>);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("obtiene el usuario actual cuando está autenticado", async () => {
    vi.mocked(useKeycloak).mockReturnValue({
      keycloak: { authenticated: true },
    } as unknown as ReturnType<typeof useKeycloak>);

    const { result } = renderHook(() => useCurrentUser(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.email).toBe("matigfv@gmail.com");
  });
});
