import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadCount, useNotificationRealtime } from "@/hooks/useNotifications";
import NavbarLogo from "./navbar/NavbarLogo";
import DesktopNavLinks from "./navbar/DesktopNavLinks";
import DesktopActions from "./navbar/DesktopActions";
import MobileMenu from "./navbar/MobileMenu";
import SearchDialog from "./navbar/SearchDialog";

const NAV_LINKS = [
  { href: "/discover?type=restaurants", label: "Restaurants", icon: "🍽️" },
  { href: "/discover?type=bars", label: "Bars & Clubs", icon: "🍸" },
  { href: "/discover?type=events", label: "Events", icon: "🎉" },
  { href: "/discover?type=experiences", label: "Experiences", icon: "✨" },
  { href: "/movies", label: "Movies", icon: "🎬" },
  { href: "/map", label: "Map", icon: "📍" },
];

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut, isVendor } = useAuth();
  const { data: unreadCount } = useUnreadCount();
  useNotificationRealtime();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActiveLink = (path: string) => {
    if (path.includes("?type=")) {
      const type = new URLSearchParams(path.split("?")[1]).get("type");
      const currentType = new URLSearchParams(location.search).get("type");
      return location.pathname === "/discover" && currentType === type;
    }
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (q: string) => {
    navigate(`/discover?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <NavbarLogo />
          <DesktopNavLinks links={NAV_LINKS} isActiveLink={isActiveLink} />
          <DesktopActions
            user={user}
            loading={loading}
            unreadCount={unreadCount}
            isVendor={isVendor}
            onSearchOpen={() => setSearchOpen(true)}
            onSignOut={handleSignOut}
            onNavigate={navigate}
          />
          <MobileMenu
            user={user}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            unreadCount={unreadCount}
            isVendor={isVendor}
            isActiveLink={isActiveLink}
            navLinks={NAV_LINKS}
            onSearchOpen={() => setSearchOpen(true)}
            onSignOut={handleSignOut}
            onNavigate={navigate}
          />
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSearch={handleSearch} />
    </nav>
  );
};

export default Navbar;
