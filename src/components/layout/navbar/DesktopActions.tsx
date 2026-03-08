import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Calendar, Sparkles, AlertTriangle, Bell, Search } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";

interface DesktopActionsProps {
  user: AuthUser | null;
  loading: boolean;
  unreadCount: number | null | undefined;
  isVendor: () => boolean;
  onSearchOpen: () => void;
  onSignOut: () => void;
  onNavigate: (path: string) => void;
}

const DesktopActions = ({
  user, loading, unreadCount, isVendor, onSearchOpen, onSignOut, onNavigate,
}: DesktopActionsProps) => (
  <div className="hidden lg:flex items-center gap-3">
    <Button variant="ghost" size="icon" onClick={onSearchOpen} className="rounded-full hover:bg-muted">
      <Search className="w-5 h-5" />
    </Button>

    {user && (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onNavigate("/notifications")}
        className="rounded-full hover:bg-muted relative"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount! > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    )}

    {loading ? (
      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
    ) : user ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-muted pl-2 pr-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-brand-cyan flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden xl:inline max-w-24 truncate font-medium">
              {user.email?.split("@")[0]}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium">{user.user_metadata?.display_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <Link to="/profile" className="flex items-center gap-3">
              <User className="w-4 h-4 text-brand-rose" />
              My Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <Link to="/profile?tab=bookings" className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              My Bookings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <Link to="/profile?tab=itineraries" className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary" />
              My Itineraries
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
            <Link to="/grievances" className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              My Grievances
            </Link>
          </DropdownMenuItem>
          {isVendor() && (
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link to="/vendor" className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                Vendor Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer rounded-lg">
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <div className="flex items-center gap-2">
        <Link to="/signin">
          <Button variant="ghost" size="sm" className="rounded-full">Sign In</Button>
        </Link>
        <Link to="/signup">
          <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-brand-cyan hover:opacity-90 shadow-lg shadow-primary/25">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </Link>
      </div>
    )}
  </div>
);

export default DesktopActions;
