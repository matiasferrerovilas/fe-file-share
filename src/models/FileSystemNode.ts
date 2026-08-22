export const FileSystemNodeType = {
  FOLDER: "FOLDER",
  FILE: "FILE",
} as const;

export type FileSystemNodeType = (typeof FileSystemNodeType)[keyof typeof FileSystemNodeType];

export interface FileSystemNodeMetadata {
  size: number | null;
  lastModified: string;
  createdAt: string;
  type: FileSystemNodeType;
  contentType: string | null;
  checksum: string | null;
  favorite: boolean;
  lastAccessedAt: string | null;
  /** Solo aplica a carpetas (`type === "FOLDER"`) — siempre null en archivos. */
  folderColor: string | null;
  folderIcon: string | null;
  /** Con cuántas personas (no apps) está compartido este nodo ahora mismo — solo una señal para
   * la UI del dueño, el listado completo de a quién se lo compartió se pide aparte. */
  sharedWithUserCount: number;
}

export interface FileSystemNode {
  id: string;
  name: string;
  children: FileSystemNode[] | null;
  shareWith: string[] | null;
  metadata: FileSystemNodeMetadata;
}
