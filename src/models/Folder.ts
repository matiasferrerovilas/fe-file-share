import type { FileItem } from "./FileItem";

export interface FolderSummary {
  id: string;
  name: string;
}

export interface FolderContents {
  folder: FolderSummary;
  breadcrumb: FolderSummary[];
  folders: FolderSummary[];
  files: FileItem[];
}
