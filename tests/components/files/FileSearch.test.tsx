import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FileSearchResult } from "../../../src/models/FileSearchResult";
import { FileSystemNodeType } from "../../../src/models/FileSystemNode";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../../../src/hooks/useFileSearch", () => ({
  useFileSearch: vi.fn(),
}));

import { useFileSearch } from "../../../src/hooks/useFileSearch";
import FileSearch from "../../../src/components/files/FileSearch";

const results: FileSearchResult[] = [
  { id: "1", name: "Presupuesto.txt", type: FileSystemNodeType.FILE, parentId: "10", path: ["Home"] },
  { id: "2", name: "Fotos", type: FileSystemNodeType.FOLDER, parentId: null, path: [] },
  { id: "3", name: "Contrato.pdf", type: FileSystemNodeType.FILE, parentId: "10", path: ["Home"] },
];

function mockResults(data: FileSearchResult[]) {
  vi.mocked(useFileSearch).mockReturnValue({ results: data, isSearching: false } as ReturnType<
    typeof useFileSearch
  >);
}

beforeEach(() => {
  mockResults(results);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("FileSearch - navegación por teclado", () => {
  it("el primer resultado ya está activo por defecto: Enter directo lo selecciona", async () => {
    const user = userEvent.setup();
    render(<FileSearch />);

    const input = screen.getByPlaceholderText("Buscar archivos y carpetas");
    await user.type(input, "algo");
    await waitFor(() => expect(screen.getByText("Presupuesto.txt")).toBeInTheDocument());

    await user.keyboard("{Enter}");

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/files/$folderId",
      params: { folderId: "10" },
    });
  });

  it("mueve el resaltado con flecha abajo antes de confirmar con Enter", async () => {
    const user = userEvent.setup();
    render(<FileSearch />);

    const input = screen.getByPlaceholderText("Buscar archivos y carpetas");
    await user.type(input, "algo");
    await waitFor(() => expect(screen.getByText("Fotos")).toBeInTheDocument());

    // Baja una vez: de "Presupuesto.txt" (índice 0, activo por defecto) a "Fotos" (índice 1).
    await user.keyboard("{ArrowDown}{Enter}");

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/files/$folderId",
      params: { folderId: "2" },
    });
  });

  it("flecha arriba no baja del primer resultado", async () => {
    const user = userEvent.setup();
    render(<FileSearch />);

    const input = screen.getByPlaceholderText("Buscar archivos y carpetas");
    await user.type(input, "algo");
    await waitFor(() => expect(screen.getByText("Presupuesto.txt")).toBeInTheDocument());

    await user.keyboard("{ArrowUp}{ArrowUp}{Enter}");

    expect(navigateMock).toHaveBeenCalledWith({
      to: "/files/$folderId",
      params: { folderId: "10" },
    });
  });

  it("Escape cierra el popover sin navegar", async () => {
    const user = userEvent.setup();
    render(<FileSearch />);

    const input = screen.getByPlaceholderText("Buscar archivos y carpetas");
    await user.type(input, "algo");
    await waitFor(() => expect(screen.getByText("Presupuesto.txt")).toBeInTheDocument());

    await user.keyboard("{Escape}");

    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "false"));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("marca aria-selected en el resultado activo", async () => {
    const user = userEvent.setup();
    render(<FileSearch />);

    const input = screen.getByPlaceholderText("Buscar archivos y carpetas");
    await user.type(input, "algo");
    await waitFor(() => expect(screen.getByText("Fotos")).toBeInTheDocument());

    await user.keyboard("{ArrowDown}");

    expect(screen.getByText("Fotos").closest('[role="option"]')).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Presupuesto.txt").closest('[role="option"]')).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});
