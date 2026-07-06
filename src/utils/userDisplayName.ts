/**
 * Obtiene el nombre a mostrar de un usuario.
 * Prioriza givenName + familyName, con fallback a email.
 */
export function getUserDisplayName(user: {
  givenName?: string | null;
  familyName?: string | null;
  email?: string | null;
}): string {
  if (user.givenName) {
    return user.familyName
      ? `${user.givenName} ${user.familyName}`.trim()
      : user.givenName;
  }
  return user.email ?? "";
}
