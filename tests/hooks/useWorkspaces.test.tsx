import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useWorkspaces } from "../../src/hooks/useWorkspaces";

const server = setupServer(
  http.get("http://localhost:8080/workspace", () =>
    HttpResponse.json([
      {
        id: 1,
        workspaceId: 10,
        workspaceName: "Familia",
        metadata: { members: [], role: "ADMIN", joinedAt: "2026-01-01", isDefault: true },
      },
    ]),
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

describe("useWorkspaces", () => {
  it("obtiene la lista de workspaces del usuario", async () => {
    const { result } = renderHook(() => useWorkspaces(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].workspaceName).toBe("Familia");
  });

  it("retorna estado de error cuando el request falla", async () => {
    server.use(
      http.get("http://localhost:8080/workspace", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useWorkspaces(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
