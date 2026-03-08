import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, User, LogOut, Settings, Calendar, MapPin, Sparkles, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SearchWithSuggestions from "@/components/search/SearchWithSuggestions";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut, isVendor } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
  { href: "/discover?type=restaurants", label: "Restaurants", icon: "🍽️" },
  { href: "/discover?type=bars", label: "Bars & Clubs", icon: "🍸" },
  { href: "/discover?type=events", label: "Events", icon: "🎉" },
  { href: "/discover?type=experiences", label: "Experiences", icon: "✨" },
  { href: "/movies", label: "Movies", icon: "🎬" },
  { href: "/map", label: "Map", icon: "📍" }];


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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ?
    "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-background/5" :
    "bg-transparent"}`
    }>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-90" />
              <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
                <span className="text-base font-heading font-extrabold gradient-text leading-none">A</span>
              </div>
            </div>
            <span className="text-xl font-heading font-extrabold tracking-tight">
              <span className="gradient-text">Ausly</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-1 bg-muted/50 backdrop-blur-sm rounded-full px-2 py-1.5">
              {navLinks.map((link) =>
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                isActiveLink(link.href) ?
                "bg-primary text-primary-foreground shadow-lg shadow-primary/25" :
                "text-muted-foreground hover:text-foreground hover:bg-muted"}`
                }>

                  <span className="flex items-center gap-2">
                    
                    {link.label}
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="rounded-full hover:bg-muted">

              <Search className="w-5 h-5" />
            </Button>

            {/* Auth Section */}
            {loading ?
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" /> :
            user ?
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
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      My Grievances
                    </Link>
                  </DropdownMenuItem>
                  {isVendor() &&
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/vendor" className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Vendor Dashboard
                      </Link>
                    </DropdownMenuItem>
                }
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive cursor-pointer rounded-lg">

                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> :

            <div className="flex items-center gap-2">
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-brand-cyan hover:opacity-90 shadow-lg shadow-primary/25">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </div>
            }
          </div>

          {/* Mobile Menu */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="rounded-full">

              <Search className="w-5 h-5" />
            </Button>
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
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

                  {/* Mobile Nav Links */}
                  <div className="flex-1 overflow-auto py-4">
                    <div className="px-4 space-y-1">
                      {navLinks.map((link) =>
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActiveLink(link.href) ?
                        "bg-primary text-primary-foreground" :
                        "text-muted-foreground hover:text-foreground hover:bg-muted"}`
                        }>

                          <span className="text-xl">{link.icon}</span>
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Mobile Auth Section */}
                  <div className="p-4 border-t border-border space-y-3">
                    {user ?
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
                        {isVendor() &&
                      <Link to="/vendor" className="block" onClick={() => setMobileOpen(false)}>
                            <Button variant="outline" className="w-full justify-start rounded-xl">
                              <Settings className="w-4 h-4 mr-3" />
                              Vendor Dashboard
                            </Button>
                          </Link>
                      }
                        <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          handleSignOut();
                          setMobileOpen(false);
                        }}>

                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </Button>
                      </> :

                    <>
                        <Link to="/signin" className="block" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full rounded-xl">
                            Sign In
                          </Button>
                        </Link>
                        <Link to="/signup" className="block" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-brand-cyan hover:opacity-90">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Get Started
                          </Button>
                        </Link>
                      </>
                    }
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Search Ausly
            </DialogTitle>
            <DialogDescription>
              Find restaurants, bars, events, and experiences across Germany
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <SearchWithSuggestions
              showButton={false}
              placeholder="Search by name, city, cuisine..."
              onSearch={(q) => {
                navigate(`/discover?q=${encodeURIComponent(q)}`);
                setSearchOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </nav>);

};

export default Navbar;