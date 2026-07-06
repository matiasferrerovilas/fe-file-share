// enums/RoleEnum.ts
export const RoleEnum = {
  ADMIN: "ADMIN",
  FAMILY: "FAMILY",
  GUEST: "GUEST",
} as const;

export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum];
