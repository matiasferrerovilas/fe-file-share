import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useUserDefault, useSetUserDefault } from "../../src/hooks/useSettings";

const server = setupServer(
  http.get("http://localhost:8080/settings/defaults/:key", ({ params }) => {
    const key = params.key as string;
    if (key === "DEFAULT_WORKSPACE") {
      return HttpResponse.json({ key: "DEFAULT_WORKSPACE", value: 10 });
    }
    return HttpResponse.json(null, { status: 404 });
  }),
  http.put(
    "http://localhost:8080/settings/defaults/:key",
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

describe("useUserDefault", () => {
  it("obtiene el valor por defecto para una key", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useUserDefault("DEFAULT_WORKSPACE"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ key: "DEFAULT_WORKSPACE", value: 10 });
  });
});

describe("useSetUserDefault", () => {
  it("invalida la query de la key modificada al tener éxito", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_WORKSPACE", value: 20 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["user-defaults", "DEFAULT_WORKSPACE"],
    });
  });

  it("además invalida el árbol de archivos cuando cambia DEFAULT_WORKSPACE", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_WORKSPACE", value: 20 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["file-system-tree"] });
  });

  it("retorna estado de error cuando el request falla", async () => {
    server.use(
      http.put("http://localhost:8080/settings/defaults/:key", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSetUserDefault(), { wrapper });

    await act(async () => {
      result.current.mutate({ key: "DEFAULT_WORKSPACE", value: 20 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
