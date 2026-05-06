import { Suspense, lazy, memo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import AiPlannerChat from "@/components/chat/AiPlannerChat";
import VendorAssistantChat from "@/components/chat/VendorAssistantChat";
import JarvisAgent from "@/components/chat/JarvisAgent";
import { CopilotProvider, useCopilot } from "@/contexts/CopilotContext";
import AdminLayout from "./components/admin/AdminLayout";
import VendorLayout from "./components/vendor/VendorLayout";

const Index = lazy(() => import("./pages/Index"));
const Discover = lazy(() => import("./pages/Discover"));
const Venue = lazy(() => import("./pages/Venue"));
const Plan = lazy(() => import("./pages/Plan"));
const Map = lazy(() => import("./pages/Map"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OurStory = lazy(() => import("./pages/OurStory"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Movies = lazy(() => import("./pages/Movies"));
const Movie = lazy(() => import("./pages/Movie"));
const Event = lazy(() => import("./pages/Event"));
const Booking = lazy(() => import("./pages/Booking"));
const MovieSearch = lazy(() => import("./pages/MovieSearch"));
const Cinemas = lazy(() => import("./pages/Cinemas"));
const Profile = lazy(() => import("./pages/Profile"));
const Itinerary = lazy(() => import("./pages/Itinerary"));
const CustomerGrievances = lazy(() => import("./pages/Grievances"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminBookings = lazy(() => import("./pages/admin/Bookings"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));
const AdminRefunds = lazy(() => import("./pages/admin/Refunds"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const AdminContent = lazy(() => import("./pages/admin/Content"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminGrievances = lazy(() => import("./pages/admin/Grievances"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminApprovals = lazy(() => import("./pages/admin/Approvals"));
const VendorDashboard = lazy(() => import("./pages/vendor/Dashboard"));
const VendorListings = lazy(() => import("./pages/vendor/Listings"));
const NewListing = lazy(() => import("./pages/vendor/NewListing"));
const EditListing = lazy(() => import("./pages/vendor/EditListing"));
const VendorBookings = lazy(() => import("./pages/vendor/Bookings"));
const VendorEvents = lazy(() => import("./pages/vendor/Events"));
const NewEvent = lazy(() => import("./pages/vendor/NewEvent"));
const EditEvent = lazy(() => import("./pages/vendor/EditEvent"));
const VendorReviews = lazy(() => import("./pages/vendor/Reviews"));
const VendorAnalytics = lazy(() => import("./pages/vendor/Analytics"));
const VendorMessages = lazy(() => import("./pages/vendor/Messages"));
const VendorSettings = lazy(() => import("./pages/vendor/Settings"));
const VendorGrievances = lazy(() => import("./pages/vendor/Grievances"));
const CityCategory = lazy(() => import("./pages/CityCategory"));

const ChatRouter = memo(function ChatRouter() {
  const location = useLocation();
  const isVendorRoute = location.pathname.startsWith("/vendor");
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) return null;
  if (isVendorRoute) return <VendorAssistantChat />;

  return (
    <>
      <div className="hidden md:block">
        <AiPlannerChat />
      </div>
      <JarvisAgent />
    </>
  );
});

const AppContent = memo(function AppContent() {
  const { isOpen } = useCopilot();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <div
        className={`min-h-screen overflow-x-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen && !isAdminRoute ? "md:mr-[420px]" : "mr-0"
        }`}
      >
        <div key={location.pathname} className="page-transition">
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes location={location}>
              <Route path="/" element={<Index />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/:city/:category" element={<CityCategory />} />
              <Route path="/venue/:id" element={<Venue />} />
              <Route path="/event/:id" element={<Event />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/map" element={<Map />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/grievances" element={<CustomerGrievances />} />
              <Route
                path="/notifications"
                element={<ProtectedRoute><Notifications /></ProtectedRoute>}
              />
              <Route
                path="/vendor"
                element={<RoleProtectedRoute requiredRole="vendor"><VendorLayout /></RoleProtectedRoute>}
              >
                <Route index element={<VendorDashboard />} />
                <Route path="listings" element={<VendorListings />} />
                <Route path="listings/new" element={<NewListing />} />
                <Route path="listings/:id/edit" element={<EditListing />} />
                <Route path="bookings" element={<VendorBookings />} />
                <Route path="events" element={<VendorEvents />} />
                <Route path="events/new" element={<NewEvent />} />
                <Route path="events/:id/edit" element={<EditEvent />} />
                <Route path="reviews" element={<VendorReviews />} />
                <Route path="analytics" element={<VendorAnalytics />} />
                <Route path="messages" element={<VendorMessages />} />
                <Route path="settings" element={<VendorSettings />} />
                <Route path="grievances" element={<VendorGrievances />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={<RoleProtectedRoute requiredRole="admin"><AdminLayout /></RoleProtectedRoute>}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="approvals" element={<AdminApprovals />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="refunds" element={<AdminRefunds />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="grievances" element={<AdminGrievances />} />
              </Route>
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/search" element={<MovieSearch />} />
              <Route path="/cinemas" element={<Cinemas />} />
              <Route path="/movie/:id" element={<Movie />} />
              <Route path="/booking/:showtimeId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/itinerary/:id" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
      <ChatRouter />
    </>
  );
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CopilotProvider>
            <AppContent />
          </CopilotProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
