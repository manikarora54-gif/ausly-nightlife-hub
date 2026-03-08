import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { createMockSupabase, createQueryMock } from "../test/mocks/supabase";

const mockSupabase = createMockSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

const mockUser = { id: "u1", email: "test@test.com", user_metadata: {} };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser, session: {}, loading: false }),
}));

import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches notifications for user", async () => {
    const mockNotifs = [
      { id: "n1", user_id: "u1", type: "booking", title: "Booking confirmed", message: "Your booking is confirmed", is_read: false, created_at: "2026-03-08T10:00:00Z", link: null },
      { id: "n2", user_id: "u1", type: "review", title: "New review", message: "You got a review", is_read: true, created_at: "2026-03-07T10:00:00Z", link: "/venue/1" },
    ];

    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: mockNotifs, error: null })
    );

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].title).toBe("Booking confirmed");
  });

  it("returns empty array when no notifications", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: [], error: null })
    );

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });
});

describe("useUnreadCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unread count", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ count: 5, error: null })
    );

    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);
  });

  it("returns 0 when no unread", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ count: 0, error: null })
    );

    const { result } = renderHook(() => useUnreadCount(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });
});

describe("useMarkAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls update on notification", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: null, error: null })
    );

    const { result } = renderHook(() => useMarkAsRead(), { wrapper: createWrapper() });

    result.current.mutate("n1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
  });
});

describe("useDeleteNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls delete on notification", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: null, error: null })
    );

    const { result } = renderHook(() => useDeleteNotification(), { wrapper: createWrapper() });

    result.current.mutate("n1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
  });
});

describe("useMarkAllAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks all as read", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: null, error: null })
    );

    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("notifications");
  });
});
