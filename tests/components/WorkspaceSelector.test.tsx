import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import WorkspaceSelector from "../../src/components/WorkspaceSelector";
import { WorkspaceContext, type WorkspaceContextValue } from "../../src/workspace/WorkspaceContext";
import type { Workspace } from "../../src/models/Workspace";

const workspace: Workspace = {
  id: 1,
  workspaceId: 10,
  workspaceName: "Familia",
  metadata: { members: [], role: "ADMIN", joinedAt: "2026-01-01", isDefault: true },
};

function renderWithContext(value: WorkspaceContextValue) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
    </QueryClientProvider>
  );
  return render(<WorkspaceSelector />, { wrapper });
}

describe("WorkspaceSelector", () => {
  it("no renderiza nada mientras está cargando", () => {
    const { container } = renderWithContext({
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: () => {},
      isLoading: true,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza nada cuando no hay workspaces", () => {
    const { container } = renderWithContext({
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: () => {},
      isLoading: false,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el workspace actual cuando hay datos", () => {
    renderWithContext({
      currentWorkspace: workspace,
      workspaces: [workspace],
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    expect(screen.getByText("Familia")).toBeInTheDocument();
  });
});
