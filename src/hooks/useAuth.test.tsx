import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { createMockSupabase } from "../mocks/supabase";

// Mock supabase before importing hooks
const mockSupabase = createMockSupabase();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

// Mock toast
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { AuthProvider, useAuth } from "@/hooks/useAuth";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("starts with loading true and no user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("sets user after session is found", async () => {
    const fakeUser = { id: "u1", email: "test@test.com", user_metadata: {} };
    const fakeSession = { user: fakeUser };
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe("u1");
    expect(result.current.session).toBeTruthy();
  });

  it("signIn calls supabase and shows toast on success", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: any;
    await act(async () => {
      res = await result.current.signIn("a@b.com", "pass123");
    });
    expect(res.error).toBeNull();
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass123",
    });
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Welcome back!" }));
  });

  it("signIn returns error on failure", async () => {
    const err = new Error("Invalid credentials");
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: err });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: any;
    await act(async () => {
      res = await result.current.signIn("a@b.com", "wrong");
    });
    expect(res.error).toBe(err);
  });

  it("signUp calls supabase with correct metadata", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp("a@b.com", "pass123", "Test User", "vendor");
    });
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "a@b.com",
        password: "pass123",
        options: expect.objectContaining({
          data: { display_name: "Test User", account_type: "vendor" },
        }),
      })
    );
  });

  it("signOut calls supabase and toasts", async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Signed out" }));
  });

  it("isVendor returns true when account_type is vendor", async () => {
    const fakeUser = { id: "u1", user_metadata: { account_type: "vendor" } };
    const fakeSession = { user: fakeUser };
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    });

    // Simulate onAuthStateChange firing
    let authCallback: any;
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      cb("SIGNED_IN", fakeSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isVendor()).toBe(true);
  });

  it("resetPassword calls supabase and toasts", async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let res: any;
    await act(async () => {
      res = await result.current.resetPassword("a@b.com");
    });
    expect(res.error).toBeNull();
    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalled();
  });
});
