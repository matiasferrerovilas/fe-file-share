export const SharePermission = {
  READ: "READ",
  WRITE: "WRITE",
  READ_WRITE: "READ_WRITE",
} as const;

export type SharePermission = (typeof SharePermission)[keyof typeof SharePermission];

export interface FileShare {
  id: string;
  fileId: string;
  apiName: string;
  permission: SharePermission;
}
