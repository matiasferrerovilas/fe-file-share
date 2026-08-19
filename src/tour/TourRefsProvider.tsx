import { useCallback, useRef, type ReactNode } from "react";
import { TourRefsContext, type TourRefsMap } from "./TourRefsContext";

interface TourRefsProviderProps {
  children: ReactNode;
}

export function TourRefsProvider({ children }: TourRefsProviderProps) {
  const refsMap = useRef<TourRefsMap>({});

  const registerRef = useCallback((key: string, el: HTMLElement | null) => {
    refsMap.current[key] = el;
  }, []);

  return <TourRefsContext.Provider value={{ registerRef, refsMap }}>{children}</TourRefsContext.Provider>;
}
