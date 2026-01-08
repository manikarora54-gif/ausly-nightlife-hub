import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Filter,
  X,
  Navigation,
  Utensils,
  Wine,
  Music
} from "lucide-react";

const mockPins = [
  { id: 1, name: "Berghain", type: "bar", lat: 52.511, lng: 13.441, rating: 4.9 },
  { id: 2, name: "Nobelhart & Schmutzig", type: "restaurant", lat: 52.508, lng: 13.387, rating: 4.9 },
  { id: 3, name: "Watergate", type: "bar", lat: 52.501, lng: 13.443, rating: 4.6 },
  { id: 4, name: "Katz Orange", type: "restaurant", lat: 52.527, lng: 13.401, rating: 4.5 },
  { id: 5, name: "Buck and Breck", type: "bar", lat: 52.530, lng: 13.397, rating: 4.7 },
];

const Map = () => {
  const [selectedVenue, setSelectedVenue] = useState<typeof mockPins[0] | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All", icon: MapPin },
    { id: "restaurant", label: "Restaurants", icon: Utensils },
    { id: "bar", label: "Bars & Clubs", icon: Wine },
    { id: "event", label: "Events", icon: Music },
  ];

  const filteredPins = mockPins.filter((pin) => {
    if (activeFilter === "all") return true;
    return pin.type === activeFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16 h-screen flex flex-col">
        {/* Search Bar */}
        <div className="p-4 glass-card border-b border-border/30">
          <div className="container mx-auto">
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

        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Placeholder Map */}
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
            {/* Grid overlay */}
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

            {/* Map Pins */}
            {filteredPins.map((pin, index) => (
              <button
                key={pin.id}
                onClick={() => setSelectedVenue(pin)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group animate-fade-in`}
                style={{
                  left: `${20 + (index * 15)}%`,
                  top: `${30 + (index * 10)}%`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedVenue?.id === pin.id 
                    ? "bg-primary scale-125 shadow-[0_0_20px_hsl(var(--primary)/0.5)]" 
                    : "bg-card hover:bg-primary/80 hover:scale-110"
                } border-2 border-primary/50`}>
                  {pin.type === "restaurant" ? (
                    <Utensils className="w-4 h-4" />
                  ) : (
                    <Wine className="w-4 h-4" />
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="glass-card px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <div className="font-semibold">{pin.name}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {pin.rating}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Center Location Button */}
            <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Selected Venue Card */}
          {selectedVenue && (
            <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 glass-card p-4 animate-fade-in">
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedVenue.type === "restaurant" ? "bg-primary/20" : "bg-secondary/20"
                }`}>
                  {selectedVenue.type === "restaurant" ? (
                    <Utensils className={`w-4 h-4 ${selectedVenue.type === "restaurant" ? "text-primary" : "text-secondary"}`} />
                  ) : (
                    <Wine className="w-4 h-4 text-secondary" />
                  )}
                </div>
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {selectedVenue.type}
                </span>
              </div>
              
              <h3 className="font-heading font-bold text-lg mb-1">{selectedVenue.name}</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{selectedVenue.rating}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Berlin</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="neon" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Directions
                </Button>
              </div>
            </div>
          )}

          {/* No API Key Notice */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 text-sm text-muted-foreground">
            <span>📍 Interactive map preview • Add Mapbox API key for full functionality</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;
