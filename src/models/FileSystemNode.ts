export const FileSystemNodeType = {
  FOLDER: "FOLDER",
  FILE: "FILE",
} as const;

export type FileSystemNodeType = (typeof FileSystemNodeType)[keyof typeof FileSystemNodeType];

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  size: number | null;
  lastModified: string;
  children: FileSystemNode[] | null;
}
