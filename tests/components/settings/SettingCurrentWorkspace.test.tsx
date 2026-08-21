import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Workspace } from "../../../src/models/Workspace";
import { WorkspaceContext, type WorkspaceContextValue } from "../../../src/workspace/WorkspaceContext";
import { SettingCurrentWorkspace } from "../../../src/components/settings/SettingCurrentWorkspace";

vi.mock("../../../src/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    // Coincide con "usuario1@email.com" en memberDetails a propósito, para poder probar que
    // el botón de eliminar nunca aparece sobre el propio usuario autenticado.
    data: { id: 1, email: "usuario1@email.com" },
  }),
}));

vi.mock("../../../src/websocket/useWorkspacesSubscription", () => ({
  useWorkspacesSubscription: vi.fn(),
}));

const mockWorkspaces: Workspace[] = [
  {
    id: 101,
    workspaceId: 1,
    workspaceName: "Familia",
    metadata: {
      members: ["usuario1@email.com", "usuario2@email.com"],
      memberDetails: [
        { userId: 1, email: "usuario1@email.com", role: "OWNER" },
        { userId: 2, email: "usuario2@email.com", role: "COLLABORATOR" },
      ],
      role: "OWNER",
      joinedAt: "2026-01-01T00:00:00",
      isDefault: true,
    },
  },
];

function renderWithContext(value: WorkspaceContextValue) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
    </QueryClientProvider>
  );
  return render(<SettingCurrentWorkspace />, { wrapper });
}

describe("SettingCurrentWorkspace", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra mensaje cuando no hay workspace seleccionado", () => {
    renderWithContext({
      currentWorkspace: null,
      workspaces: [],
      setCurrentWorkspace: () => {},
      isLoading: false,
    });

    expect(screen.getByText("No hay workspace seleccionado")).toBeInTheDocument();
  });

  it("muestra el nombre del workspace y los miembros", async () => {
    renderWithContext({
      currentWorkspace: mockWorkspaces[0],
      workspaces: mockWorkspaces,
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    expect(screen.getByText("Familia")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("usuario1@email.com")).toBeInTheDocument());
    expect(screen.getByText("usuario2@email.com")).toBeInTheDocument();
  });

  it("muestra el botón de invitar miembro", () => {
    renderWithContext({
      currentWorkspace: mockWorkspaces[0],
      workspaces: mockWorkspaces,
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    expect(screen.getByRole("button", { name: "Invitar miembro" })).toBeInTheDocument();
  });

  it("muestra el botón de eliminar en otros miembros cuando el usuario es OWNER", async () => {
    renderWithContext({
      currentWorkspace: mockWorkspaces[0],
      workspaces: mockWorkspaces,
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    await waitFor(() =>
      expect(
        screen.getByLabelText("Eliminar a usuario2@email.com del workspace"),
      ).toBeInTheDocument(),
    );
  });

  it("no muestra el botón de eliminar sobre uno mismo, aunque sea OWNER", async () => {
    renderWithContext({
      currentWorkspace: mockWorkspaces[0],
      workspaces: mockWorkspaces,
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    await waitFor(() => expect(screen.getByText("usuario1@email.com")).toBeInTheDocument());
    expect(
      screen.queryByLabelText("Eliminar a usuario1@email.com del workspace"),
    ).not.toBeInTheDocument();
  });

  it("no muestra el botón de eliminar cuando el usuario no es OWNER", async () => {
    const nonOwnerWorkspace: Workspace = {
      ...mockWorkspaces[0],
      metadata: { ...mockWorkspaces[0].metadata, role: "COLLABORATOR" },
    };

    renderWithContext({
      currentWorkspace: nonOwnerWorkspace,
      workspaces: [nonOwnerWorkspace],
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    await waitFor(() => expect(screen.getByText("usuario2@email.com")).toBeInTheDocument());
    expect(
      screen.queryByLabelText("Eliminar a usuario2@email.com del workspace"),
    ).not.toBeInTheDocument();
  });

  it("muestra el botón de salir cuando hay más de un workspace", () => {
    const second: Workspace = { ...mockWorkspaces[0], id: 102, workspaceId: 2, workspaceName: "Trabajo" };
    renderWithContext({
      currentWorkspace: mockWorkspaces[0],
      workspaces: [mockWorkspaces[0], second],
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    expect(screen.getByRole("button", { name: "Salir del workspace" })).toBeInTheDocument();
  });

  it("no muestra el botón de salir cuando solo hay un workspace", () => {
    renderWithContext({
      currentWorkspace: mockWorkspaces[0],
      workspaces: mockWorkspaces,
      setCurrentWorkspace: vi.fn(),
      isLoading: false,
    });

    expect(screen.queryByRole("button", { name: "Salir del workspace" })).not.toBeInTheDocument();
  });
});
