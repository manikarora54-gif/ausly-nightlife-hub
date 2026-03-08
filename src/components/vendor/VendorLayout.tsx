import { useState } from "react";
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
  Plus,
  Star,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/listings", label: "My Listings", icon: Store },
  { href: "/vendor/bookings", label: "Bookings", icon: Calendar },
  { href: "/vendor/events", label: "Events", icon: CalendarDays },
  { href: "/vendor/reviews", label: "Reviews", icon: Star },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/messages", label: "Messages", icon: MessageSquare },
  { href: "/vendor/grievances", label: "Support", icon: AlertTriangle },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/3 blur-[180px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[350px] h-[350px] rounded-full bg-secondary/3 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

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

      <div className="flex relative z-10">
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-secondary/20">
                  V
                </div>
                <h1 className="text-xl font-heading font-bold gradient-text">Vendor Portal</h1>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-border/30">
              <Link to="/vendor/listings/new">
                <Button className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Listing
                </Button>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
                        ? "bg-primary/20 text-primary border border-primary/30 shadow-sm shadow-primary/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border/30 space-y-3">
              <Button variant="outline" className="w-full justify-start hover:border-primary/30 transition-colors" onClick={handleLogout}>
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
