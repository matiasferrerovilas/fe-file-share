export interface EventWrapper<T> {
  eventType: EventType;
  message: T;
}

export const EventType = {
  INVITATION_ADDED: "INVITATION_ADDED",
  MEMBERSHIP_UPDATED: "MEMBERSHIP_UPDATED",
  WORKSPACE_LEFT: "WORKSPACE_LEFT",
  USER_FILE_SHARED: "USER_FILE_SHARED",
  USER_FILE_SHARE_EXPIRING: "USER_FILE_SHARE_EXPIRING",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];
