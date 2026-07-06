import { useState, useEffect, type ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";

const STORAGE_KEY = "theme";

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Set initial data-theme attribute on mount
  useEffect(() => {
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
