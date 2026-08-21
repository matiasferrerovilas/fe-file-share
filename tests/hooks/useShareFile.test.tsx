import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useShareFile } from "../../src/hooks/useShareFile";
import { SharePermission } from "../../src/models/FileShare";

const server = setupServer(
  http.post(
    "http://localhost:8080/shares",
    () => HttpResponse.json({ id: "share-1", fileId: "file-1", apiName: "api-movements", permission: "READ_WRITE" }),
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

describe("useShareFile", () => {
  it("comparte un archivo e invalida el árbol de archivos", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useShareFile(), { wrapper });

    await act(async () => {
      result.current.mutate({ fileId: "file-1", apiName: "api-movements", permission: SharePermission.READ_WRITE });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["file-system-tree"] });
  });

  it("retorna estado de error cuando el request falla", async () => {
    server.use(
      http.post("http://localhost:8080/shares", () =>
        HttpResponse.json({ message: "Conflict" }, { status: 409 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useShareFile(), { wrapper });

    await act(async () => {
      result.current.mutate({ fileId: "file-1", apiName: "api-movements", permission: SharePermission.READ_WRITE });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
