import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import CreateWorkspaceModal from "../../src/components/modals/CreateWorkspaceModal";

let postHandler = vi.fn();

const server = setupServer(
  http.post("http://localhost:8080/workspace", async ({ request }) => {
    postHandler(await request.json());
    return HttpResponse.json({ id: 1 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  postHandler = vi.fn();
});
afterAll(() => server.close());

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(
    <CreateWorkspaceModal>
      {(openModal) => <button onClick={openModal}>abrir</button>}
    </CreateWorkspaceModal>,
    { wrapper },
  );
}

describe("CreateWorkspaceModal", () => {
  it("abre el modal al invocar la función que recibe el children render-prop", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("abrir"));

    expect(screen.getByText("Nuevo workspace")).toBeInTheDocument();
  });

  it("muestra un error de validación cuando se envía sin nombre", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("abrir"));
    await user.click(screen.getByRole("button", { name: /crear workspace/i }));

    await waitFor(() => {
      expect(screen.getByText("Ingresa el nombre del workspace")).toBeInTheDocument();
    });
  });

  it("envía el nombre ingresado al crear el workspace", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText("abrir"));
    await user.type(screen.getByPlaceholderText("Ej: Familia"), "Casa Nueva");
    await user.click(screen.getByRole("button", { name: /crear workspace/i }));

    await waitFor(() => {
      expect(postHandler).toHaveBeenCalledWith({ description: "Casa Nueva" });
    });
  });
});
