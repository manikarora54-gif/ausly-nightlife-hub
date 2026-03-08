import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, User, LogOut, Settings, Sparkles, AlertTriangle, Bell } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { NavLinkItem } from "./DesktopNavLinks";

interface MobileMenuProps {
  user: AuthUser | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  unreadCount: number | null | undefined;
  isVendor: () => boolean;
  isActiveLink: (path: string) => boolean;
  navLinks: NavLinkItem[];
  onSearchOpen: () => void;
  onSignOut: () => void;
  onNavigate: (path: string) => void;
}

const MobileMenu = ({
  user, mobileOpen, setMobileOpen, unreadCount, isVendor,
  isActiveLink, navLinks, onSearchOpen, onSignOut, onNavigate,
}: MobileMenuProps) => (
  <div className="flex lg:hidden items-center gap-2">
    <Button variant="ghost" size="icon" onClick={onSearchOpen} className="rounded-full">
      <Search className="w-5 h-5" />
    </Button>

    {user && (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate("/notifications")}
        className="rounded-full relative"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount! > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    )}

    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
              <div className="relative w-9 h-9 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
                <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
                  <span className="text-base font-heading font-extrabold gradient-text leading-none">A</span>
                </div>
              </div>
              <span className="text-xl font-heading font-extrabold">
                <span className="gradient-text">Ausly</span>
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActiveLink(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="p-4 border-t border-border space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-brand-cyan flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.user_metadata?.display_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Link to="/grievances" className="block" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full justify-start rounded-xl">
                    <AlertTriangle className="w-4 h-4 mr-3 text-muted-foreground" />
                    My Grievances
                  </Button>
                </Link>
                {isVendor() && (
                  <Link to="/vendor" className="block" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-start rounded-xl">
                      <Settings className="w-4 h-4 mr-3" />
                      Vendor Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => { onSignOut(); setMobileOpen(false); }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin" className="block" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">Sign In</Button>
                </Link>
                <Link to="/signup" className="block" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-brand-cyan hover:opacity-90">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
);

export default MobileMenu;
