import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { Invitations } from "../../src/models/Workspace";
import type { EventWrapper } from "../../src/websocket/EventWrapper";
import { EventType } from "../../src/websocket/EventWrapper";
import { useInvitationSubscription } from "../../src/websocket/useInvitationSubscription";

vi.mock("../../src/hooks/useCurrentUser", () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock("../../src/websocket/WebSocketProvider", () => ({
  useWebSocket: vi.fn(),
}));

import { useCurrentUser } from "../../src/hooks/useCurrentUser";
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

const userEmail = "me@test.com";
const invitation: Invitations = {
  id: 1,
  workspaceId: 10,
  workspaceName: "Familia",
  invitedByEmail: "other@test.com",
  status: "PENDING",
  createdAt: "2026-07-16T10:00:00",
};

describe("useInvitationSubscription", () => {
  let queryClient: QueryClient;
  let wsMock: ReturnType<typeof makeWsMock>;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    wsMock = makeWsMock();

    vi.mocked(useCurrentUser).mockReturnValue({
      data: { email: userEmail },
    } as ReturnType<typeof useCurrentUser>);
    vi.mocked(useWebSocket).mockReturnValue(wsMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to /topic/invitations/{email}/new", () => {
    renderHook(() => useInvitationSubscription(), { wrapper: makeWrapper(queryClient) });

    expect(wsMock.subscribe).toHaveBeenCalledWith(
      `/topic/invitations/${userEmail}/new`,
      expect.any(Function),
    );
    expect(wsMock.subscribe).toHaveBeenCalledTimes(1);
  });

  it("does not subscribe when there is no email yet", () => {
    vi.mocked(useCurrentUser).mockReturnValue({ data: undefined } as ReturnType<typeof useCurrentUser>);

    renderHook(() => useInvitationSubscription(), { wrapper: makeWrapper(queryClient) });

    expect(wsMock.subscribe).not.toHaveBeenCalled();
  });

  it("adds a new invitation to the cache on INVITATION_ADDED", () => {
    queryClient.setQueryData(["workspace-invitations"], []);
    renderHook(() => useInvitationSubscription(), { wrapper: makeWrapper(queryClient) });

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, {
        eventType: EventType.INVITATION_ADDED,
        message: invitation,
      });
    });

    expect(queryClient.getQueryData(["workspace-invitations"])).toEqual([invitation]);
  });

  it("does not add a duplicate invitation", () => {
    queryClient.setQueryData(["workspace-invitations"], [invitation]);
    renderHook(() => useInvitationSubscription(), { wrapper: makeWrapper(queryClient) });

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, {
        eventType: EventType.INVITATION_ADDED,
        message: invitation,
      });
    });

    expect(queryClient.getQueryData<Invitations[]>(["workspace-invitations"])).toHaveLength(1);
  });

  it("ignores an invitation sent by the current user", () => {
    queryClient.setQueryData(["workspace-invitations"], []);
    renderHook(() => useInvitationSubscription(), { wrapper: makeWrapper(queryClient) });

    act(() => {
      wsMock.trigger(`/topic/invitations/${userEmail}/new`, {
        eventType: EventType.INVITATION_ADDED,
        message: { ...invitation, invitedByEmail: userEmail },
      });
    });

    expect(queryClient.getQueryData<Invitations[]>(["workspace-invitations"])).toEqual([]);
  });
});
