import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MoveToFolderModal from "../../src/components/files/MoveToFolderModal";
import { FileSystemNodeType, type FileSystemNode } from "../../src/models/FileSystemNode";
import { ROOT_FOLDER_ID } from "../../src/api/foldersApi";

vi.mock("../../src/hooks/useFileSystemTree", () => ({
  useFileSystemTree: vi.fn(),
}));

import { useFileSystemTree } from "../../src/hooks/useFileSystemTree";

function folderAt(id: string, name: string, children: FileSystemNode[] = []): FileSystemNode {
  return {
    id,
    name,
    children,
    shareWith: null,
    metadata: {
      size: null,
      lastModified: "",
      createdAt: "",
      type: FileSystemNodeType.FOLDER,
      contentType: null,
      checksum: null,
      favorite: false,
      lastAccessedAt: null,
    },
  };
}

function fileAt(id: string, name: string): FileSystemNode {
  return {
    id,
    name,
    children: null,
    shareWith: null,
    metadata: {
      size: 100,
      lastModified: "",
      createdAt: "",
      type: FileSystemNodeType.FILE,
      contentType: "text/plain",
      checksum: null,
      favorite: false,
      lastAccessedAt: null,
    },
  };
}

const tree = [
  folderAt("root", "Home", [folderAt("f1", "Fotos"), fileAt("doc1", "notas.txt")]),
];

beforeEach(() => {
  vi.mocked(useFileSystemTree).mockReturnValue({ data: tree } as unknown as ReturnType<typeof useFileSystemTree>);
});

describe("MoveToFolderModal", () => {
  it("no renderiza contenido cuando open es false", () => {
    render(<MoveToFolderModal open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText("Fotos")).not.toBeInTheDocument();
  });

  it("muestra la raíz y las subcarpetas, pero no los archivos", () => {
    render(<MoveToFolderModal open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Fotos")).toBeInTheDocument();
    expect(screen.queryByText("notas.txt")).not.toBeInTheDocument();
  });

  it("el botón de mover está deshabilitado hasta elegir una carpeta", async () => {
    const user = userEvent.setup();
    render(<MoveToFolderModal open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole("button", { name: /mover acá/i })).toBeDisabled();

    await user.click(screen.getByText("Fotos"));

    expect(screen.getByRole("button", { name: /mover acá/i })).toBeEnabled();
  });

  it("llama a onConfirm con el id de la carpeta seleccionada", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<MoveToFolderModal open={true} onClose={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByText("Fotos"));
    await user.click(screen.getByRole("button", { name: /mover acá/i }));

    expect(onConfirm).toHaveBeenCalledWith("f1");
  });

  it("permite seleccionar la raíz como destino", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<MoveToFolderModal open={true} onClose={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByText("Home"));
    await user.click(screen.getByRole("button", { name: /mover acá/i }));

    expect(onConfirm).toHaveBeenCalledWith(ROOT_FOLDER_ID);
  });

  it("resetea la selección y llama a onClose al cancelar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MoveToFolderModal open={true} onClose={onClose} onConfirm={vi.fn()} />);

    await user.click(screen.getByText("Fotos"));
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
