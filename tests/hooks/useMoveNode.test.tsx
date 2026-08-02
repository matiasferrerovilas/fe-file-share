import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "antd";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { useMoveNode } from "../../src/hooks/useMoveNode";
import { useFileSystemTree } from "../../src/hooks/useFileSystemTree";
import { WorkspaceContext, type WorkspaceContextValue } from "../../src/workspace/WorkspaceContext";
import type { Workspace } from "../../src/models/Workspace";

const treeRoot = {
  id: "root",
  name: "root",
  type: "FOLDER",
  size: null,
  lastModified: "2026-01-01T00:00:00Z",
  children: [
    {
      id: "20",
      name: "docs",
      type: "FOLDER",
      size: null,
      lastModified: "2026-01-01T00:00:00Z",
      children: [
        {
          id: "21",
          name: "child",
          type: "FOLDER",
          size: null,
          lastModified: "2026-01-01T00:00:00Z",
          children: [],
        },
      ],
    },
    {
      id: "30",
      name: "photos",
      type: "FOLDER",
      size: null,
      lastModified: "2026-01-01T00:00:00Z",
      children: [],
    },
  ],
};

let moveHandler = vi.fn();

const server = setupServer(
  http.get("http://localhost:8080/folders/tree", () => HttpResponse.json(treeRoot)),
  http.patch("http://localhost:8080/folders/:nodeId/move", async ({ params, request }) => {
    moveHandler(params.nodeId, await request.json());
    return HttpResponse.json(treeRoot);
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  moveHandler = vi.fn();
});
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
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={workspaceValue}>
        <App>{children}</App>
      </WorkspaceContext.Provider>
    </QueryClientProvider>
  );
}

// Precarga el árbol en el cache compartido antes de ejercitar useMoveNode,
// para que moveIfValid ya vea los nodos al llamarlo.
async function renderMoveNode(wrapper: ReturnType<typeof makeWrapper>) {
  const treeHook = renderHook(() => useFileSystemTree(), { wrapper });
  await waitFor(() => expect(treeHook.result.current.isSuccess).toBe(true));

  return renderHook(() => useMoveNode(), { wrapper });
}

describe("useMoveNode", () => {
  it("no hace nada cuando draggedId está vacío", async () => {
    const wrapper = makeWrapper();
    const { result } = await renderMoveNode(wrapper);

    act(() => {
      result.current.moveIfValid("", "root");
    });

    expect(moveHandler).not.toHaveBeenCalled();
  });

  it("no hace nada cuando draggedId es igual al targetFolderId", async () => {
    const wrapper = makeWrapper();
    const { result } = await renderMoveNode(wrapper);

    act(() => {
      result.current.moveIfValid("20", "20");
    });

    expect(moveHandler).not.toHaveBeenCalled();
  });

  it("mueve un nodo a un destino válido", async () => {
    const wrapper = makeWrapper();
    const { result } = await renderMoveNode(wrapper);

    act(() => {
      result.current.moveIfValid("30", "20");
    });

    await waitFor(() => expect(moveHandler).toHaveBeenCalledWith("30", { parentId: 20 }));
  });

  it("no permite mover una carpeta dentro de uno de sus propios descendientes", async () => {
    const wrapper = makeWrapper();
    const { result } = await renderMoveNode(wrapper);

    act(() => {
      result.current.moveIfValid("20", "21");
    });

    expect(moveHandler).not.toHaveBeenCalled();
  });
});
