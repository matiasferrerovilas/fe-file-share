import type { FileSystemNodeType } from "./FileSystemNode";

export interface FileSearchResult {
  id: string;
  name: string;
  type: FileSystemNodeType;
  parentId: string | null;
  // Nombres de las carpetas ancestras, desde la raíz hasta (sin incluir) este resultado —
  // ya resuelto por el backend, no hace falta caminar parentId a mano en el cliente.
  path: string[];
}
