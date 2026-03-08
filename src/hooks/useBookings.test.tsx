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
  return {
    mockSupabase: { from: vi.fn().mockReturnValue(createQueryMock()) },
    createQueryMock,
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: mockSupabase }));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1", email: "t@t.com", user_metadata: {} }, session: {}, loading: false }),
}));

import { useBookings, useCancelBooking } from "@/hooks/useBookings";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("useBookings", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("fetches bookings for user", async () => {
    const bookings = [{ id: "b1", user_id: "u1", booking_date: "2026-03-10", status: "confirmed", booking_type: "restaurant" }];
    mockSupabase.from.mockReturnValue(createQueryMock({ data: bookings, error: null }));

    const { result } = renderHook(() => useBookings(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
  });

  it("returns error when fetch fails", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: null, error: new Error("DB error") }));
    const { result } = renderHook(() => useBookings(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("returns empty array when no bookings", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: [], error: null }));
    const { result } = renderHook(() => useBookings(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });
});

describe("useCancelBooking", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("calls update with cancelled status", async () => {
    mockSupabase.from.mockReturnValue(createQueryMock({ data: { id: "b1", status: "cancelled" }, error: null }));
    const { result } = renderHook(() => useCancelBooking(), { wrapper: createWrapper() });
    result.current.mutate("b1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
  });
});
