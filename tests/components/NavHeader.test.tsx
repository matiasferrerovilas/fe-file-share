import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ThemeContext } from "../../src/theme/ThemeContext";

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("../../src/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}));

vi.mock("../../src/components/WorkspaceSelector", () => ({
  default: () => <div data-testid="workspace-selector" />,
}));

import { useKeycloak } from "@react-keycloak/web";

const logoutMock = vi.fn();

function mockDefaults() {
  vi.mocked(useKeycloak).mockReturnValue({
    keycloak: {
      tokenParsed: { preferred_username: "testuser", email: "test@test.com" },
      logout: logoutMock,
    },
    initialized: true,
  } as unknown as ReturnType<typeof useKeycloak>);
}

function makeWrapper(isDark: boolean, toggleTheme = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <ConfigProvider>{children}</ConfigProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

const { default: NavHeader } = await import("../../src/components/NavHeader");

function renderNavHeader(isDark = false, toggleTheme = vi.fn()) {
  return render(<NavHeader />, { wrapper: makeWrapper(isDark, toggleTheme) });
}

beforeEach(() => {
  mockDefaults();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("NavHeader", () => {
  it("muestra el avatar del usuario", () => {
    renderNavHeader(false);
    expect(document.querySelector(".ant-avatar")).toBeInTheDocument();
  });

  it("muestra 'Modo oscuro' en el dropdown cuando está en modo light", async () => {
    const user = userEvent.setup();
    renderNavHeader(false);

    await user.click(document.querySelector(".ant-avatar") as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("Modo oscuro")).toBeInTheDocument();
    });
  });

  it("muestra 'Modo claro' en el dropdown cuando está en modo dark", async () => {
    const user = userEvent.setup();
    renderNavHeader(true);

    await user.click(document.querySelector(".ant-avatar") as HTMLElement);

    await waitFor(() => {
      expect(screen.getByText("Modo claro")).toBeInTheDocument();
    });
  });

  it("llama a toggleTheme al hacer click en la opción de tema", async () => {
    const toggleTheme = vi.fn();
    const user = userEvent.setup();
    renderNavHeader(false, toggleTheme);

    await user.click(document.querySelector(".ant-avatar") as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText("Modo oscuro")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Modo oscuro"));

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("llama a keycloak.logout al hacer click en 'Cerrar sesión'", async () => {
    const user = userEvent.setup();
    renderNavHeader(false);

    await user.click(document.querySelector(".ant-avatar") as HTMLElement);
    await waitFor(() => {
      expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Cerrar sesión"));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
