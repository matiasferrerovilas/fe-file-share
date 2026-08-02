import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RenameNodeModal from "../../src/components/files/RenameNodeModal";

vi.mock("../../src/hooks/useRenameNode", () => ({
  useRenameNode: vi.fn(),
}));

import { useRenameNode } from "../../src/hooks/useRenameNode";

const mutateMock = vi.fn();

beforeEach(() => {
  vi.mocked(useRenameNode).mockReturnValue({
    mutate: mutateMock,
    isPending: false,
  } as unknown as ReturnType<typeof useRenameNode>);
});

describe("RenameNodeModal", () => {
  it("no renderiza el modal cuando node es null", () => {
    render(<RenameNodeModal node={null} onClose={vi.fn()} />);
    expect(screen.queryByText("Renombrar")).not.toBeInTheDocument();
  });

  it("precarga el input con el nombre actual del nodo", async () => {
    render(<RenameNodeModal node={{ id: "1", name: "Fotos" }} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Fotos")).toBeInTheDocument();
    });
  });

  it("llama a mutate con el nodeId y el nombre trimeado al confirmar", async () => {
    const user = userEvent.setup();
    render(<RenameNodeModal node={{ id: "42", name: "Fotos" }} onClose={vi.fn()} />);

    const input = await screen.findByDisplayValue("Fotos");
    await user.clear(input);
    await user.type(input, "  Vacaciones  ");
    await user.click(screen.getByRole("button", { name: /renombrar/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        { nodeId: "42", name: "Vacaciones" },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });
});
