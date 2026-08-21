import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Workspace } from "../../src/models/Workspace";
import type { EventWrapper } from "../../src/websocket/EventWrapper";
import { EventType } from "../../src/websocket/EventWrapper";
import { useWorkspacesSubscription } from "../../src/websocket/useWorkspacesSubscription";

vi.mock("../../src/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("../../src/hooks/useWorkspaces", () => ({
  USER_WORKSPACES_QUERY_KEY: ["user-workspaces"],
  useWorkspaces: vi.fn(),
}));

vi.mock("../../src/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useCurrentUser } from "../../src/hooks/useCurrentUser";
import { useWorkspaces } from "../../src/hooks/useWorkspaces";
import { useWebSocket } from "../../src/websocket/WebSocketProvider";

function makeWsMock() {
  const subscriptions = new Map<string, (event: EventWrapper<unknown>) => void>();
  return {
    isConnected: true,
    subscribe: vi.fn((topic: string, cb: (e: EventWrapper<unknown>) => void) => {
      subscriptions.set(topic, cb);
    }),
    unsubscribe: vi.fn((topic: string) => {
      subscriptions.delete(topic);
    }),
    trigger: (topic: string, event: EventWrapper<unknown>) => {
      subscriptions.get(topic)?.(event);
    },
  };
}

function makeWrapper(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const userEmail = "user@test.com";
const memberships: Workspace[] = [
  {
    id: 1,
    workspaceId: 10,
    workspaceName: "Familia",
    metadata: { members: [], memberDetails: [], role: "OWNER", joinedAt: "2026-01-01", isDefault: true },
  },
];

describe("useWorkspacesSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wsMock = makeWsMock();

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { email: userEmail },
    } as ReturnType<typeof useCurrentUser>);
    vi.mocked(useWorkspaces).mockReturnValue({
      data: memberships,
    } as ReturnType<typeof useWorkspaces>);
    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to the membership-removed topic and per-membership members/update topics", () => {
    renderHook(() => useWorkspacesSubscription(), { wrapper: makeWrapper(queryClient) });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/membership/${userEmail}/remove`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/workspace/${memberships[0].workspaceId}/members/update`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(2);
  });

  it("does not subscribe when there is no email yet", () => {
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as ReturnType<typeof useCurrentUser>);

    renderHook(() => useWorkspacesSubscription(), { wrapper: makeWrapper(queryClient) });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("invalidates user-workspaces on MEMBERSHIP_UPDATED", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useWorkspacesSubscription(), { wrapper: makeWrapper(queryClient) });

    act(() => {
      wsMock.trigger(`/topic/workspace/${memberships[0].workspaceId}/members/update`, {
        eventType: EventType.MEMBERSHIP_UPDATED,
        message: {},
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
  });

  it("invalidates user-workspaces on WORKSPACE_LEFT", () => {
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderHook(() => useWorkspacesSubscription(), { wrapper: makeWrapper(queryClient) });

    act(() => {
      wsMock.trigger(`/topic/membership/${userEmail}/remove`, {
        eventType: EventType.WORKSPACE_LEFT,
        message: {},
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user-workspaces"] });
  });
});
