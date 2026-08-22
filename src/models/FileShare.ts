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

/** A share with a specific person (by email), as opposed to FileShare which shares with another
 * app in the suite. `expiresAt` null means it never expires. */
export interface UserFileShare {
  id: string;
  fileId: string;
  sharedWithUserId: string;
  sharedWithEmail: string;
  permission: SharePermission;
  expiresAt: string | null;
  createdAt: string;
}
