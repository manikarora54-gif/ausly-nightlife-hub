import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

function renderPlan() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const session = { user: fakeUser };
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
    cb("SIGNED_IN", session);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
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

  it("renders the page header and AI branding", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("AI-Powered Planning")).toBeInTheDocument();
      expect(screen.getByText(/Plan Your Perfect/i)).toBeInTheDocument();
    });
  });

  it("renders step 1 with city selection buttons", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Use getAllByText since city names appear in footer too
    expect(screen.getAllByText("Berlin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Munich").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Hamburg").length).toBeGreaterThanOrEqual(1);
  });

  it("shows progress bar steps", async () => {
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

    // Select Berlin — click the button inside the city grid (not footer link)
    const cityButtons = screen.getAllByText("Berlin");
    // Find the one inside a button element (city selector)
    const cityButton = cityButtons.find((el) => el.closest("button"));
    fireEvent.click(cityButton || cityButtons[0]);

    expect(continueBtn).not.toBeDisabled();
  });

  it("navigates from step 1 to step 2 after selecting a city", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Select city
    const cityButtons = screen.getAllByText("Munich");
    const cityButton = cityButtons.find((el) => el.closest("button"));
    fireEvent.click(cityButton || cityButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("What's the vibe?")).toBeInTheDocument();
    });

    expect(screen.getByText("Romantic")).toBeInTheDocument();
    expect(screen.getByText("Chill & Casual")).toBeInTheDocument();
    expect(screen.getByText("Party Mode")).toBeInTheDocument();
    expect(screen.getByText("Foodie Adventure")).toBeInTheDocument();
    expect(screen.getByText("Budget per person")).toBeInTheDocument();
  });

  it("navigates from step 2 to step 3 after selecting vibe and budget", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Step 1
    const cityButtons = screen.getAllByText("Berlin");
    fireEvent.click(cityButtons.find((el) => el.closest("button")) || cityButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("What's the vibe?")).toBeInTheDocument();
    });

    // Step 2
    fireEvent.click(screen.getByText("Romantic"));
    fireEvent.click(screen.getByText("€€"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("Final details")).toBeInTheDocument();
    });
    expect(screen.getByText("Group size")).toBeInTheDocument();
  });

  it("back button returns to previous step", async () => {
    renderPlan();

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });

    // Go to step 2
    const cityButtons = screen.getAllByText("Berlin");
    fireEvent.click(cityButtons.find((el) => el.closest("button")) || cityButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText("What's the vibe?")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    await waitFor(() => {
      expect(screen.getByText("Where are you heading?")).toBeInTheDocument();
    });
  });
});
