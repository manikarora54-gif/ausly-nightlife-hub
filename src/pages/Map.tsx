import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useVenues, Venue } from "@/hooks/useVenues";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createVenueIcon = (type: string, isSelected: boolean) => {
  const color = isSelected ? "#8B5CF6" : type.toLowerCase() === "restaurant" || type.toLowerCase() === "cafe" ? "#F97316" : type.toLowerCase() === "club" || type.toLowerCase() === "bar" ? "#EC4899" : "#06B6D4";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transform:${isSelected ? 'scale(1.3)' : 'scale(1)'};transition:transform 0.2s;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Component to fit map bounds to venues
function FitBounds({ venues }: { venues: Venue[] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = venues.filter((v) => v.latitude && v.longitude);
    if (withCoords.length > 0) {
      const bounds = L.latLngBounds(withCoords.map((v) => [Number(v.latitude), Number(v.longitude)]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [venues, map]);
  return null;
}

const Map = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: venues = [], isLoading } = useVenues({ search: search || undefined, limit: 50 });

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

  const mappableVenues = filteredVenues.filter((v) => v.latitude && v.longitude);

  // Default center: Berlin
  const center: [number, number] = [52.52, 13.405];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 h-screen flex flex-col">
        {/* Search & Filters */}
        <div className="p-4 glass-card border-b border-border/30 z-[1000] relative">
          <div className="container mx-auto">
            <Breadcrumbs
              items={[{ label: "Home", href: "/" }, { label: "Map" }]}
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

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={12}
              className="w-full h-full z-0"
              style={{ background: "hsl(var(--background))" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <FitBounds venues={mappableVenues} />
              {mappableVenues.map((venue) => (
                <Marker
                  key={venue.id}
                  position={[Number(venue.latitude), Number(venue.longitude)]}
                  icon={createVenueIcon(venue.type, selectedVenue?.id === venue.id)}
                  eventHandlers={{
                    click: () => setSelectedVenue(venue),
                  }}
                >
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <h3 className="font-bold text-base mb-1" style={{ color: "#1a1a2e" }}>{venue.name}</h3>
                      <p className="text-gray-500 text-xs capitalize mb-1">{venue.type} • {venue.city}</p>
                      {venue.average_rating && (
                        <p className="text-xs mb-2" style={{ color: "#1a1a2e" }}>⭐ {Number(venue.average_rating).toFixed(1)} ({venue.review_count} reviews)</p>
                      )}
                      {venue.short_description && (
                        <p className="text-xs text-gray-600 mb-2">{venue.short_description}</p>
                      )}
                      <a href={`/venue/${venue.slug}`} className="text-xs font-medium text-purple-600 hover:underline">
                        View Details →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Selected venue panel */}
          {selectedVenue && (
            <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 glass-card p-4 animate-fade-in z-[1000]">
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-medium text-muted-foreground capitalize">{selectedVenue.type}</span>
              <h3 className="font-heading font-bold text-lg mb-1">{selectedVenue.name}</h3>
              {selectedVenue.short_description && (
                <p className="text-sm text-muted-foreground mb-2">{selectedVenue.short_description}</p>
              )}
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
                  <Button variant="neon" size="sm" className="w-full">View Details</Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const query = encodeURIComponent(`${selectedVenue.name} ${selectedVenue.city}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                  }}
                >
                  Directions
                </Button>
              </div>
            </div>
          )}

          {/* Venue count badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 text-sm text-muted-foreground z-[1000]">
            📍 {mappableVenues.length} venues on map
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;
