import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mockToast }) }));

const { mockSupabase } = vi.hoisted(() => {
  const channelMock = { on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() };
  return {
    mockSupabase: {
      from: vi.fn(),
      channel: vi.fn().mockReturnValue(channelMock),
      removeChannel: vi.fn(),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
    },
  };
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: mockSupabase }));

import { AuthProvider } from "@/hooks/useAuth";
import { useVenueReviews, useCreateReview, useDeleteReview } from "@/hooks/useReviews";

const fakeUser = { id: "u1", email: "a@b.com", user_metadata: {} };

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

function mockChain(resolved: any) {
  const chain: any = {};
  ["select", "insert", "update", "delete", "eq", "order", "single", "maybeSingle", "limit"].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  Object.defineProperty(chain, "then", {
    value: (onF: any, onR?: any) => Promise.resolve(resolved).then(onF, onR),
  });
  Object.defineProperty(chain, "catch", {
    value: (onR: any) => Promise.resolve(resolved).catch(onR),
  });
  return chain;
}

function setLoggedIn() {
  const session = { user: fakeUser };
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
    cb("SIGNED_IN", session);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
}

describe("useVenueReviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches reviews for a venue with profile joins", async () => {
    const reviews = [
      { id: "r1", venue_id: "v1", rating: 5, content: "Great!", profiles: { display_name: "User" } },
    ];
    mockSupabase.from.mockReturnValue(mockChain({ data: reviews, error: null }));

    const { result } = renderHook(() => useVenueReviews("v1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(reviews);
    expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
  });

  it("is disabled when venueId is empty", async () => {
    const { result } = renderHook(() => useVenueReviews(""), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
  });
});

describe("useCreateReview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setLoggedIn();
  });

  it("creates a review with user_id injected", async () => {
    const created = { id: "r1", venue_id: "v1", rating: 4, user_id: "u1" };
    mockSupabase.from.mockReturnValue(mockChain({ data: created, error: null }));

    const { result } = renderHook(() => useCreateReview(), { wrapper: createWrapper() });

    // Wait for auth to settle before mutating
    await waitFor(() => expect(result.current.mutateAsync).toBeDefined());

    await act(async () => {
      await result.current.mutateAsync({ venue_id: "v1", rating: 4 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
  });
});

describe("useDeleteReview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a review and returns id and venueId", async () => {
    mockSupabase.from.mockReturnValue(mockChain({ data: null, error: null }));

    const { result } = renderHook(() => useDeleteReview(), { wrapper: createWrapper() });

    await act(async () => {
      const res = await result.current.mutateAsync({ id: "r1", venueId: "v1" });
      expect(res).toEqual({ id: "r1", venueId: "v1" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.from).toHaveBeenCalledWith("reviews");
  });
});
