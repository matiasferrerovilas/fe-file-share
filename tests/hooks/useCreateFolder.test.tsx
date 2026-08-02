import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useCreateFolder } from "../../src/hooks/useCreateFolder";
import { WorkspaceContext, type WorkspaceContextValue } from "../../src/workspace/WorkspaceContext";
import type { Workspace } from "../../src/models/Workspace";

const server = setupServer(
  http.post("http://localhost:8080/folders", async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      id: "new-folder",
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
  const workspace: Workspace = {
    id: 1,
    workspaceId: 10,
    workspaceName: "Familia",
    metadata: { members: [], role: "ADMIN", joinedAt: "2026-01-01", isDefault: true },
  };
  const workspaceValue: WorkspaceContextValue = {
    currentWorkspace: workspace,
    workspaces: [],
    setCurrentWorkspace: () => {},
    isLoading: false,
  };
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <WorkspaceContext.Provider value={workspaceValue}>{children}</WorkspaceContext.Provider>
      </QueryClientProvider>
    ),
  };
}

describe("useCreateFolder", () => {
  it("crea una carpeta e invalida el árbol de archivos", async () => {
    const { wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateFolder(), { wrapper });

    await act(async () => {
      result.current.mutate({ folderId: "root", name: "Fotos" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Fotos");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["file-system-tree"] });
  });

  it("retorna estado de error cuando el request falla", async () => {
    server.use(
      http.post("http://localhost:8080/folders", () =>
        HttpResponse.json({ message: "Server Error" }, { status: 500 }),
      ),
    );

    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCreateFolder(), { wrapper });

    await act(async () => {
      result.current.mutate({ folderId: "root", name: "Fotos" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
