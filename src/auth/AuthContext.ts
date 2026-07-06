import { createContext } from "react";

export interface AuthContextState {
  authenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextState>({
  authenticated: false,
  loading: true,
});
