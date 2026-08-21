import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useRevokeShare } from "../../src/hooks/useRevokeShare";

const server = setupServer(
  http.get("http://localhost:8080/shares", ({ request }) => {
    const fileId = new URL(request.url).searchParams.get("fileId");
    if (fileId !== "file-1") return HttpResponse.json([]);
    return HttpResponse.json([
      { id: "share-9", fileId: "file-1", apiName: "api-movements", permission: "READ_WRITE" },
    ]);
  }),
  http.delete("http://localhost:8080/shares/:shareId", () => new HttpResponse(null, { status: 204 })),
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

describe("useRevokeShare", () => {
  it("resuelve el id del share por fileId+apiName y lo revoca, invalidando el árbol de archivos", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    let deletedShareId: string | undefined;
    server.use(
      http.delete("http://localhost:8080/shares/:shareId", ({ params }) => {
        deletedShareId = params.shareId as string;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useRevokeShare(), { wrapper });

    await act(async () => {
      result.current.mutate({ fileId: "file-1", apiName: "api-movements" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deletedShareId).toBe("share-9");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["file-system-tree"] });
  });

  it("no llama a delete cuando no encuentra un share para ese apiName", async () => {
    let deleteWasCalled = false;
    server.use(
      http.delete("http://localhost:8080/shares/:shareId", () => {
        deleteWasCalled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useRevokeShare(), { wrapper });

    await act(async () => {
      result.current.mutate({ fileId: "file-1", apiName: "api-keep-other" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteWasCalled).toBe(false);
  });

  it("retorna estado de error cuando el DELETE falla", async () => {
    server.use(
      http.delete("http://localhost:8080/shares/:shareId", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );
    const { wrapper } = makeWrapper();

    const { result } = renderHook(() => useRevokeShare(), { wrapper });

    await act(async () => {
      result.current.mutate({ fileId: "file-1", apiName: "api-movements" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
