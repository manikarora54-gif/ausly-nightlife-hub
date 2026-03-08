import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
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
import { useFavorites, useIsFavorite } from "@/hooks/useFavorites";

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
  ["select", "insert", "delete", "eq", "order", "single", "maybeSingle", "limit"].forEach((m) => {
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

describe("useFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setLoggedIn();
  });

  it("fetches user favorites with venue and event joins", async () => {
    const favorites = [
      { id: "f1", user_id: "u1", venue_id: "v1", event_id: null, venues: { name: "Bar" }, events: null },
    ];
    mockSupabase.from.mockReturnValue(mockChain({ data: favorites, error: null }));

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(favorites);
    expect(mockSupabase.from).toHaveBeenCalledWith("user_favorites");
  });

  it("returns empty array when no favorites", async () => {
    mockSupabase.from.mockReturnValue(mockChain({ data: [], error: null }));

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useIsFavorite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setLoggedIn();
  });

  it("returns true when venue is favorited", async () => {
    mockSupabase.from.mockReturnValue(mockChain({ data: { id: "f1" }, error: null }));

    const { result } = renderHook(() => useIsFavorite("v1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it("returns false when venue is not favorited", async () => {
    mockSupabase.from.mockReturnValue(mockChain({ data: null, error: null }));

    const { result } = renderHook(() => useIsFavorite("v1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it("is disabled when no venueId or eventId provided", async () => {
    const { result } = renderHook(() => useIsFavorite(undefined, undefined), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
  });
});
