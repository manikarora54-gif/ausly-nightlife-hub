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

import { useBookings, useCreateBooking, useCancelBooking } from "@/hooks/useBookings";

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useBookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches bookings for the authenticated user", async () => {
    const mockBookings = [
      { id: "b1", user_id: "u1", booking_date: "2026-03-10", status: "confirmed", booking_type: "restaurant" },
      { id: "b2", user_id: "u1", booking_date: "2026-03-11", status: "pending", booking_type: "event" },
    ];

    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: mockBookings, error: null })
    );

    const { result } = renderHook(() => useBookings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].id).toBe("b1");
    expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
  });

  it("returns error when fetch fails", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: null, error: new Error("DB error") })
    );

    const { result } = renderHook(() => useBookings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("DB error");
  });

  it("returns empty array when no bookings", async () => {
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: [], error: null })
    );

    const { result } = renderHook(() => useBookings(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(0);
  });
});

describe("useCancelBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls update with cancelled status", async () => {
    const updatedBooking = { id: "b1", status: "cancelled" };
    mockSupabase.from.mockReturnValue(
      createQueryMock({ data: updatedBooking, error: null })
    );

    const { result } = renderHook(() => useCancelBooking(), { wrapper: createWrapper() });

    result.current.mutate("b1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
  });
});
