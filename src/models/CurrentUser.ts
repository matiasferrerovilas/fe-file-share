export interface CurrentUserMetadata {
  isFirstLogin: boolean;
  hasSeenTour: boolean;
  userRole: string[];
}

export interface CurrentUser {
  id: number | null;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
  userType: string | null;
  metadata: CurrentUserMetadata;
}
export interface User {
  id: number;
  givenName: string | null;
}
