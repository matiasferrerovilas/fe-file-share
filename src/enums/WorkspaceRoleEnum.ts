// Rol del usuario DENTRO de un workspace puntual (OWNER/COLLABORATOR/READ_ONLY) — distinto de
// RoleEnum, que es el rol global de la suite (ADMIN/FAMILY/GUEST).
export const WorkspaceRoleEnum = {
  OWNER: "OWNER",
  COLLABORATOR: "COLLABORATOR",
  READ_ONLY: "READ_ONLY",
} as const;

export type WorkspaceRoleEnum = (typeof WorkspaceRoleEnum)[keyof typeof WorkspaceRoleEnum];
