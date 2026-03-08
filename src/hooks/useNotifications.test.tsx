import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const { mockSupabase, createQueryMock } = vi.hoisted(() => {
  function createQueryMock(resolvedValue: any = { data: [], error: null }) {
    const chain: any = {};
    const methods = ["select","insert","update","delete","eq","neq","order","limit","single","maybeSingle","filter","range"];
    methods.forEach((m) => { chain[m] = vi.fn().mockReturnValue(chain); });
    Object.defineProperty(chain, "then", {
      value: (onFulfilled: any, onRejected?: any) => Promise.resolve(resolvedValue).then(onFulfilled, onRejected),
    });
    Object.defineProperty(chain, "catch", {
      value: (onRejected: any) => Promise.resolve(resolvedValue).catch(onRejected),
    });
    return chain;
  }
  const channelMock = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() };
  return {
    mockSupabase: {
      from: vi.fn().mockReturnValue(createQueryMock()),
      channel: vi.fn().mockReturnValue(channelMock),
      removeChannel: vi.fn(),
    },
    createQueryMock,
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: mockSupabase }));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1", email: "t@t.com", user_metadata: {} }, session: {}, loading: false }),
}));

import {
  useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification,
} from "@/hooks/useNotifications";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useNotifications", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches notifications for user", async () => {
    const notifs = [
      { id: "n1", user_id: "u1", type: "booking", title: "Confirmed", message: "ok", is_read: false, created_at: "2026-03-08T10:00:00Z", link: null },
    ];
    mockSupabase.from.mockReturnValue(createQueryMock({ data: notifs, error: null }));
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("returns empty when none", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: [], error: null }));
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });
});

describe("useUnreadCount", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns unread count", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ count: 5, error: null }));
    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);
  });
});

describe("useMarkAsRead", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("calls update on notification", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: null, error: null }));
    const { result } = renderHook(() => useMarkAsRead(), { wrapper: createWrapper() });
    result.current.mutate("n1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
  });
});

describe("useDeleteNotification", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("calls delete on notification", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: null, error: null }));
    const { result } = renderHook(() => useDeleteNotification(), { wrapper: createWrapper() });
    result.current.mutate("n1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
  });
});

describe("useMarkAllAsRead", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("marks all as read", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: null, error: null }));
    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper: createWrapper() });
    result.current.mutate();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
  });
});
