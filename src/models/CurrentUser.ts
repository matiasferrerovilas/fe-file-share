export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  isFirstLogin: boolean;
  hasSeenTour: boolean;
}
export interface User {
  id: number;
  givenName: string | null;
}
