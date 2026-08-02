import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useFileSystemTree } from "../../src/hooks/useFileSystemTree";
import { WorkspaceContext, type WorkspaceContextValue } from "../../src/workspace/WorkspaceContext";
import type { Workspace } from "../../src/models/Workspace";

const server = setupServer(
  http.get("http://localhost:8080/folders/tree", ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      id: "root",
      name: "root",
      type: "FOLDER",
      size: null,
      lastModified: "2026-01-01T00:00:00Z",
      children: [],
      workspaceId: url.searchParams.get("workspaceId"),
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeWrapper(workspaceOverrides: Partial<WorkspaceContextValue> = {}) {
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
    ...workspaceOverrides,
  };
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={workspaceValue}>{children}</WorkspaceContext.Provider>
    </QueryClientProvider>
  );
}

describe("useFileSystemTree", () => {
  it("no ejecuta el fetch cuando no hay workspace actual", () => {
    const { result } = renderHook(() => useFileSystemTree(), {
      wrapper: makeWrapper({ currentWorkspace: null }),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("obtiene el árbol de archivos para el workspace actual", async () => {
    const { result } = renderHook(() => useFileSystemTree(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].id).toBe("root");
  });
});
