import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  X,
  Navigation,
  Utensils,
  Wine,
  Music,
  Loader2
} from "lucide-react";
import { useVenues, Venue } from "@/hooks/useVenues";

const Map = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: venues = [], isLoading } = useVenues({ search: search || undefined, limit: 30 });

  const filters = [
    { id: "all", label: "All", icon: MapPin },
    { id: "restaurant", label: "Restaurants", icon: Utensils },
    { id: "bar", label: "Bars & Clubs", icon: Wine },
    { id: "live_music", label: "Live Music", icon: Music },
  ];

  const filteredVenues = venues.filter((v) => {
    if (activeFilter === "all") return true;
    const type = v.type.toLowerCase();
    if (activeFilter === "restaurant") return type === "restaurant" || type === "cafe";
    if (activeFilter === "bar") return type === "bar" || type === "club" || type === "beer garden";
    if (activeFilter === "live_music") return type === "live_music" || type === "live music";
    return type === activeFilter;
  });

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "restaurant" || t === "cafe") return Utensils;
    if (t === "live_music" || t === "live music") return Music;
    return Wine;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 h-screen flex flex-col">
        <div className="p-4 glass-card border-b border-border/30">
          <div className="container mx-auto">
            <Breadcrumbs 
              items={[
                { label: "Home", href: "/" },
                { label: "Map" },
              ]}
              showBack={false}
            />
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search venues near you..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter.id)}
                    className="flex-shrink-0"
                  >
                    <filter.icon className="w-4 h-4 mr-2" />
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div 
            className="w-full h-full"
            style={{
              background: `
                radial-gradient(circle at 30% 40%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 60%, hsl(var(--secondary) / 0.1) 0%, transparent 50%),
                linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)
              `,
            }}
          >
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />

            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              filteredVenues.slice(0, 20).map((venue, index) => {
                const Icon = getIcon(venue.type);
                return (
                  <button
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group animate-fade-in"
                    style={{
                      left: `${10 + ((index * 37) % 80)}%`,
                      top: `${15 + ((index * 23) % 65)}%`,
                      animationDelay: `${index * 0.05}s`,
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      selectedVenue?.id === venue.id 
                        ? "bg-primary scale-125 shadow-[0_0_20px_hsl(var(--primary)/0.5)]" 
                        : "bg-card hover:bg-primary/80 hover:scale-110"
                    } border-2 border-primary/50`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="glass-card px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                        <div className="font-semibold">{venue.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          {Number(venue.average_rating || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {selectedVenue && (
            <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 glass-card p-4 animate-fade-in">
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {selectedVenue.type}
                </span>
              </div>
              
              <h3 className="font-heading font-bold text-lg mb-1">{selectedVenue.name}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{Number(selectedVenue.average_rating || 0).toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{selectedVenue.city}</span>
              </div>
              
              <div className="flex gap-2">
                <Link to={`/venue/${selectedVenue.slug}`} className="flex-1">
                  <Button variant="neon" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const query = encodeURIComponent(`${selectedVenue.name} ${selectedVenue.city}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                >
                  Directions
                </Button>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 text-sm text-muted-foreground">
            <span>📍 Interactive map preview • {filteredVenues.length} venues</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;
