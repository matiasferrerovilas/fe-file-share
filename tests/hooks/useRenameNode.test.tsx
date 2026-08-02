import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useRenameNode } from "../../src/hooks/useRenameNode";

const server = setupServer(
  http.patch("http://localhost:8080/folders/:nodeId", async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      id: "node-1",
      name: body.name,
      type: "FOLDER",
      size: null,
      lastModified: "2026-01-01T00:00:00Z",
      children: [],
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useRenameNode", () => {
  it("renombra un nodo e invalida el árbol de archivos", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRenameNode(), { wrapper });

    await act(async () => {
      result.current.mutate({ nodeId: "node-1", name: "Nuevo nombre" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Nuevo nombre");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["file-system-tree"] });
  });

  it("retorna estado de error cuando el request falla", async () => {
    server.use(
      http.patch("http://localhost:8080/folders/:nodeId", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useRenameNode(), { wrapper });

    await act(async () => {
      result.current.mutate({ nodeId: "node-1", name: "x" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
