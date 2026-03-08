import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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

// Mock react-markdown to avoid ESM issues in jsdom
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

import { AuthProvider } from "@/hooks/useAuth";
import Plan from "@/pages/Plan";

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

const fakeUser = { id: "u1", email: "a@b.com", user_metadata: { display_name: "Test" } };

function renderPlan(loggedIn = true) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  if (loggedIn) {
    const session = { user: fakeUser };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
      cb("SIGNED_IN", session);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  }
  // Mock notifications/favorites etc.
  mockSupabase.from.mockReturnValue(mockChain({ data: [], error: null, count: 0 }));

  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/plan"]}>
        <AuthProvider>
          <Routes>
            <Route path="/plan" element={<Plan />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Plan Page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders step 1 with city selection", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Should show city options
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Munich")).toBeInTheDocument();
    expect(screen.getByText("Hamburg")).toBeInTheDocument();
    expect(screen.getByText("Frankfurt")).toBeInTheDocument();
    expect(screen.getByText("Cologne")).toBeInTheDocument();
    expect(screen.getByText("Düsseldorf")).toBeInTheDocument();
  });

  it("shows progress bar with correct steps", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("📍 City")).toBeInTheDocument();
      expect(screen.getByText("✨ Preferences")).toBeInTheDocument();
      expect(screen.getByText("📅 Details")).toBeInTheDocument();
      expect(screen.getByText("🎉 Itinerary")).toBeInTheDocument();
    });
  });

  it("Continue button is disabled until city is selected", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    // Select Berlin
    fireEvent.click(screen.getByText("Berlin"));
    expect(continueBtn).not.toBeDisabled();
  });

  it("navigates from step 1 to step 2 after selecting a city", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Select city and continue
    fireEvent.click(screen.getByText("Munich"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Step 2: vibe selection
    await waitFor(() => {
      expect(screen.getByText("What's the vibe?")).toBeInTheDocument();
    });

    // Should show vibe options
    expect(screen.getByText("Romantic")).toBeInTheDocument();
    expect(screen.getByText("Chill & Casual")).toBeInTheDocument();
    expect(screen.getByText("Party Mode")).toBeInTheDocument();
    expect(screen.getByText("Foodie Adventure")).toBeInTheDocument();

    // Should show budget selector
    expect(screen.getByText("Budget per person")).toBeInTheDocument();
  });

  it("navigates from step 2 to step 3 after selecting vibe and budget", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Step 1: select city
    fireEvent.click(screen.getByText("Berlin"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("What's the vibe?")).toBeInTheDocument();
    });

    // Step 2: select vibe and budget
    fireEvent.click(screen.getByText("Romantic"));
    fireEvent.click(screen.getByText("€€"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Step 3: details
    await waitFor(() => {
      expect(screen.getByText("Final details")).toBeInTheDocument();
    });

    // Should show group size and date inputs
    expect(screen.getByText("Group size")).toBeInTheDocument();
  });

  it("back button returns to previous step", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Go to step 2
    fireEvent.click(screen.getByText("Berlin"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("What's the vibe?")).toBeInTheDocument();
    });

    // Click back
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    // Should be back at step 1
    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });
  });

  it("renders the page header and AI branding", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("AI-Powered Planning")).toBeInTheDocument();
      expect(screen.getByText(/Plan Your Perfect/i)).toBeInTheDocument();
      expect(screen.getByText("Night Out")).toBeInTheDocument();
    });
  });
});
