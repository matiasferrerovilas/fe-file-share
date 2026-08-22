export const FileActivityAction = {
  UPLOADED: "UPLOADED",
  RENAMED: "RENAMED",
  MOVED: "MOVED",
  DELETED: "DELETED",
  RESTORED: "RESTORED",
  SHARED: "SHARED",
  UNSHARED: "UNSHARED",
} as const;

export type FileActivityAction = (typeof FileActivityAction)[keyof typeof FileActivityAction];

export interface FileActivity {
  id: string;
  action: FileActivityAction;
  actorUserId: string;
  actorEmail: string;
  fileName: string;
  detail: string | null;
  createdAt: string;
}
