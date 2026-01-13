import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Store, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  LogOut,
  CalendarDays,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/listings", label: "My Listings", icon: Store },
  { href: "/vendor/bookings", label: "Bookings", icon: Calendar },
  { href: "/vendor/events", label: "Events", icon: CalendarDays },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/messages", label: "Messages", icon: MessageSquare },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkVendorAccess();
  }, []);

  const checkVendorAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/signin");
        return;
      }

      // Check if user has vendor or admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      // Cast roles to check for vendor access (vendor role will be added via migration)
      const hasVendorAccess = roles?.some(r => 
        (r.role as string) === "vendor" || r.role === "admin"
      );
      
      if (!hasVendorAccess) {
        toast({
          title: "Access Denied",
          description: "You need vendor access to view this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // For now, create a mock vendor profile since table may not exist yet
      const profile = {
        business_name: "My Business",
        is_verified: false,
        user_id: user.id,
      };

      setVendorProfile(profile);
      setLoading(false);
    } catch (error) {
      console.error("Error checking vendor access:", error);
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-heading font-bold gradient-text">Vendor Portal</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-40 w-64 glass-card border-r border-border/30 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 lg:h-20 flex items-center px-6 border-b border-border/30">
              <h1 className="text-xl font-heading font-bold gradient-text">Vendor Portal</h1>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-border/30">
              <Link to="/vendor/listings/new">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Listing
                </Button>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== "/vendor" && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Vendor Info & Logout */}
            <div className="p-4 border-t border-border/30 space-y-3">
              {vendorProfile && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{vendorProfile.business_name}</p>
                  <p className="text-xs">{vendorProfile.is_verified ? "✓ Verified" : "Pending verification"}</p>
                </div>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  ← Back to Ausly
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
          <div className="p-4 lg:p-8">
            <Outlet context={{ vendorProfile }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
