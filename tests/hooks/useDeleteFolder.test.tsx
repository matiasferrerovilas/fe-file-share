import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useDeleteFolder } from "../../src/hooks/useDeleteFolder";

const server = setupServer(
  http.delete(
    "http://localhost:8080/folders/:folderId",
    () => new HttpResponse(null, { status: 200 }),
  ),
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

describe("useDeleteFolder", () => {
  it("elimina una carpeta e invalida el árbol de archivos", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteFolder(), { wrapper });

    await act(async () => {
      result.current.mutate("folder-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["file-system-tree"] });
  });

  it("retorna estado de error cuando el request falla", async () => {
    server.use(
      http.delete("http://localhost:8080/folders/:folderId", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useDeleteFolder(), { wrapper });

    await act(async () => {
      result.current.mutate("folder-1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
