import { createContext, useContext } from "react";

export type TourRefsMap = Record<string, HTMLElement | null>;

export interface TourRefsContextValue {
  registerRef: (key: string, el: HTMLElement | null) => void;
  refsMap: React.MutableRefObject<TourRefsMap>;
}

/**
 * The onboarding tour anchors its steps to real nav/toolbar elements that live in different,
 * sibling parts of the tree (NavHeader is mounted at the root, FolderTreeSidebar only within the
 * file-explorer routes) — this context is the shared registry both sides write into, so AppTour
 * can read a single ref map regardless of which component actually renders each target. Mirrors
 * the `navRefsMap` pattern already used for this in fe-movements.
 */
export const TourRefsContext = createContext<TourRefsContextValue | null>(null);

export function useTourRefs(): TourRefsContextValue {
  const ctx = useContext(TourRefsContext);
  if (!ctx) {
    throw new Error("useTourRefs must be used within a TourRefsProvider");
  }
  return ctx;
}
