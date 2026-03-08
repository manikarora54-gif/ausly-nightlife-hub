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
import { useProfile, useUserRoles } from "@/hooks/useProfile";

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
  ["select", "eq", "order", "single", "maybeSingle", "limit"].forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.then = (resolve: any) => resolve(resolved);
  Object.defineProperty(chain, "then", {
    value: (onF: any, onR?: any) => Promise.resolve(resolved).then(onF, onR),
  });
  Object.defineProperty(chain, "catch", {
    value: (onR: any) => Promise.resolve(resolved).catch(onR),
  });
  return chain;
}

const fakeUser = { id: "u1", email: "a@b.com", user_metadata: {} };

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const session = { user: fakeUser };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      cb("SIGNED_IN", session);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  it("fetches the current user profile", async () => {
    const profile = { id: "u1", display_name: "Test", email: "a@b.com" };
    mockSupabase.from.mockReturnValue(mockChain({ data: profile, error: null }));

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(profile);
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
  });

  it("returns null when no user is authenticated", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    // Query should not be enabled, so stays idle/no data
    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(result.current.data).toBeUndefined();
  });
});

describe("useUserRoles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const session = { user: fakeUser };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      cb("SIGNED_IN", session);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  it("fetches user roles as string array", async () => {
    const roles = [{ role: "user" }, { role: "vendor" }];
    mockSupabase.from.mockReturnValue(mockChain({ data: roles, error: null }));

    const { result } = renderHook(() => useUserRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(["user", "vendor"]);
    expect(mockSupabase.from).toHaveBeenCalledWith("user_roles");
  });

  it("returns empty array when no roles found", async () => {
    mockSupabase.from.mockReturnValue(mockChain({ data: [], error: null }));

    const { result } = renderHook(() => useUserRoles(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
