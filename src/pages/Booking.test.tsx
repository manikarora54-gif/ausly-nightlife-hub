import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
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

import { AuthProvider } from "@/hooks/useAuth";
import Booking from "@/pages/Booking";

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

function setLoggedIn() {
  const session = { user: fakeUser };
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  mockSupabase.auth.onAuthStateChange.mockImplementation((cb: any) => {
    cb("SIGNED_IN", session);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
}

function renderBooking(searchParams: string = "?type=reservation&venueName=TestVenue&price=25") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  setLoggedIn();
  mockSupabase.from.mockReturnValue(mockChain({ data: [], error: null, count: 0 }));

  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/booking${searchParams}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/booking" element={<Booking />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Booking Page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders step 1 with booking details form", async () => {
    renderBooking();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "TestVenue" })).toBeInTheDocument();
    });

    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Special Requests")).toBeInTheDocument();
  });

  it("shows correct category config for reservation type", async () => {
    renderBooking("?type=reservation&venueName=Fancy%20Restaurant&price=50");

    await waitFor(() => {
      expect(screen.getByText("Restaurant Reservation")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Fancy Restaurant" })).toBeInTheDocument();
    });
  });

  it("shows correct category config for movie type", async () => {
    renderBooking("?type=movie&eventName=Dune&price=15");

    await waitFor(() => {
      expect(screen.getByText("Movie Tickets")).toBeInTheDocument();
    });
  });

  it("navigates from step 1 to step 2 (review)", async () => {
    renderBooking("?type=reservation&venueName=TestVenue&price=25");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "TestVenue" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /review booking/i }));

    await waitFor(() => {
      expect(screen.getByText("Booking Summary")).toBeInTheDocument();
    });
    expect(screen.getByText("Price Breakdown")).toBeInTheDocument();
  });

  it("submits booking and shows confirmation (step 3)", async () => {
    const bookingResult = {
      id: "b1",
      confirmation_code: "AUS-TEST1234",
      user_id: "u1",
      booking_type: "reservation",
      booking_date: "2026-03-15",
      status: "confirmed",
    };
    mockSupabase.from.mockReturnValue(mockChain({ data: bookingResult, error: null }));

    renderBooking("?type=reservation&venueName=TestVenue&price=25");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "TestVenue" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /review booking/i }));
    await waitFor(() => {
      expect(screen.getByText("Booking Summary")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /pay/i }));

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
    });
  });

  it("renders popular time slots for restaurant bookings", async () => {
    renderBooking("?type=reservation&venueName=TestVenue&price=0");

    await waitFor(() => {
      expect(screen.getByText("Popular times")).toBeInTheDocument();
    });
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.getByText("19:00")).toBeInTheDocument();
  });

  it("shows free booking flow when price is 0", async () => {
    renderBooking("?type=reservation&venueName=FreeDinner&price=0");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "FreeDinner" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /review booking/i }));

    await waitFor(() => {
      expect(screen.getByText("Booking Summary")).toBeInTheDocument();
    });
    expect(screen.queryByText("Price Breakdown")).not.toBeInTheDocument();
  });
});
