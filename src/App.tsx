import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Venue from "./pages/Venue";
import Plan from "./pages/Plan";
import Map from "./pages/Map";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import Movies from "./pages/Movies";
import Movie from "./pages/Movie";
import Booking from "./pages/Booking";
import MovieSearch from "./pages/MovieSearch";
import Cinemas from "./pages/Cinemas";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminBookings from "./pages/admin/Bookings";
import AdminPayments from "./pages/admin/Payments";
import AdminRefunds from "./pages/admin/Refunds";
import AdminSupport from "./pages/admin/Support";
import AdminContent from "./pages/admin/Content";
import AdminSettings from "./pages/admin/Settings";
import VendorLayout from "./components/vendor/VendorLayout";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorListings from "./pages/vendor/Listings";
import VendorBookings from "./pages/vendor/Bookings";
import VendorEvents from "./pages/vendor/Events";
import VendorAnalytics from "./pages/vendor/Analytics";
import VendorMessages from "./pages/vendor/Messages";
import VendorSettings from "./pages/vendor/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/venue/:id" element={<Venue />} />
            <Route path="/event/:id" element={<Venue />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/map" element={<Map />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            {/* Vendor Routes */}
            <Route path="/vendor" element={<VendorLayout />}>
              <Route index element={<VendorDashboard />} />
              <Route path="listings" element={<VendorListings />} />
              <Route path="bookings" element={<VendorBookings />} />
              <Route path="events" element={<VendorEvents />} />
              <Route path="analytics" element={<VendorAnalytics />} />
              <Route path="messages" element={<VendorMessages />} />
              <Route path="settings" element={<VendorSettings />} />
            </Route>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="refunds" element={<AdminRefunds />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/search" element={<MovieSearch />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="/booking/:showtimeId" element={<Booking />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
