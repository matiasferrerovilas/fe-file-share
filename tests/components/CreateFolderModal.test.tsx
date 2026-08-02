import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateFolderModal from "../../src/components/files/CreateFolderModal";

vi.mock("../../src/hooks/useCreateFolder", () => ({
  useCreateFolder: vi.fn(),
}));

import { useCreateFolder } from "../../src/hooks/useCreateFolder";

const mutateMock = vi.fn();

beforeEach(() => {
  vi.mocked(useCreateFolder).mockReturnValue({
    mutate: mutateMock,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateFolder>);
});

describe("CreateFolderModal", () => {
  it("no renderiza el modal cuando open es false", () => {
    render(<CreateFolderModal folderId="root" open={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Nueva carpeta")).not.toBeInTheDocument();
  });

  it("muestra un error de validación cuando se envía sin nombre", async () => {
    const user = userEvent.setup();
    render(<CreateFolderModal folderId="root" open={true} onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /crear carpeta/i }));

    await waitFor(() => {
      expect(screen.getByText("Ingresá el nombre de la carpeta")).toBeInTheDocument();
    });
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("llama a mutate con el folderId y el nombre trimeado", async () => {
    const user = userEvent.setup();
    render(<CreateFolderModal folderId="root" open={true} onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Ej: Fotos"), "  Vacaciones  ");
    await user.click(screen.getByRole("button", { name: /crear carpeta/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        { folderId: "root", name: "Vacaciones" },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });
});
