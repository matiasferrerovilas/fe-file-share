import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFileSearch } from "../../src/hooks/useFileSearch";
import { WorkspaceContext, type WorkspaceContextValue } from "../../src/workspace/WorkspaceContext";
import { FileSystemNodeType } from "../../src/models/FileSystemNode";
import type { FileSearchResult } from "../../src/models/FileSearchResult";

vi.mock("../../src/api/foldersApi", () => ({
  searchFiles: vi.fn(),
}));

import { searchFiles } from "../../src/api/foldersApi";

const results: FileSearchResult[] = [
  { id: "1", name: "Presupuesto.txt", type: FileSystemNodeType.FILE, parentId: "10", path: ["Home"] },
];

function makeWorkspace(overrides: Partial<WorkspaceContextValue> = {}): WorkspaceContextValue {
  return {
    currentWorkspace: {
      id: 1,
      workspaceId: 5,
      workspaceName: "Familia",
      metadata: { members: [], memberDetails: [], role: "OWNER", joinedAt: "", isDefault: true },
    },
    workspaces: [],
    setCurrentWorkspace: () => {},
    isLoading: false,
    ...overrides,
  };
}

function renderWithWorkspace(query: string, workspace: WorkspaceContextValue) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(({ q }: { q: string }) => useFileSearch(q), { wrapper, initialProps: { q: query } });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(searchFiles).mockResolvedValue(results);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useFileSearch", () => {
  it("returns no results and does not call the API for a blank query", async () => {
    const { result } = renderWithWorkspace("   ", makeWorkspace());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.results).toEqual([]);
    expect(searchFiles).not.toHaveBeenCalled();
  });

  it("debounces a query change before hitting the API", async () => {
    const { rerender } = renderWithWorkspace("", makeWorkspace());
    rerender({ q: "factura" });

    expect(searchFiles).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });
    expect(searchFiles).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(searchFiles).toHaveBeenCalledWith(5, "factura");
  });

  it("trims the query before searching", async () => {
    renderWithWorkspace("  factura  ", makeWorkspace());

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(searchFiles).toHaveBeenCalledWith(5, "factura");
  });

  it("marks isSearching true while the debounce/fetch is in flight, false once results land", async () => {
    const { result } = renderWithWorkspace("factura", makeWorkspace());

    expect(result.current.isSearching).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(result.current.isSearching).toBe(false);
    expect(result.current.results).toEqual(results);
  });

  it("does not call the API when there is no current workspace", async () => {
    renderWithWorkspace("factura", makeWorkspace({ currentWorkspace: null }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(searchFiles).not.toHaveBeenCalled();
  });
});
