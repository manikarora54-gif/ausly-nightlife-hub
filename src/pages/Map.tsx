import { useState, useEffect, useMemo } from "react";
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
  Utensils,
  Wine,
  Music,
  Loader2,
  Film,
  Calendar,
  Compass,
} from "lucide-react";
import { useVenues, Venue } from "@/hooks/useVenues";
import { useEvents, Event } from "@/hooks/useEvents";
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

/** Unified map item that can represent a venue or an event */
interface MapItem {
  id: string;
  name: string;
  type: string;
  category: "venue" | "event";
  slug: string;
  city: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  image?: string | null;
  eventType?: string;
}

const getMarkerColor = (item: MapItem, isSelected: boolean): string => {
  if (isSelected) return "#8B5CF6";
  if (item.category === "event") {
    if (item.eventType === "movie") return "#EF4444";
    if (item.eventType === "experience" || item.eventType === "tour") return "#10B981";
    return "#F59E0B"; // generic event
  }
  const t = item.type.toLowerCase();
  if (t === "restaurant" || t === "cafe") return "#F97316";
  if (t === "club" || t === "bar" || t === "beer garden") return "#EC4899";
  return "#06B6D4";
};

const getMarkerSvg = (item: MapItem): string => {
  if (item.category === "event") {
    if (item.eventType === "movie")
      return `<rect x="6" y="4" width="12" height="16" rx="2" stroke="white" fill="none" stroke-width="2"/>`;
    return `<rect x="4" y="5" width="16" height="14" rx="2" stroke="white" fill="none" stroke-width="2"/><line x1="4" y1="9" x2="20" y2="9" stroke="white" stroke-width="2"/>`;
  }
  return `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="white" fill="none" stroke-width="2.5"/><circle cx="12" cy="10" r="3" stroke="white" fill="none" stroke-width="2.5"/>`;
};

const createMapIcon = (item: MapItem, isSelected: boolean) => {
  const color = getMarkerColor(item, isSelected);
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transform:${isSelected ? "scale(1.3)" : "scale(1)"};transition:transform 0.2s;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${getMarkerSvg(item)}
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

function FitBounds({ items }: { items: MapItem[] }) {
  const map = useMap();
  useEffect(() => {
    if (items.length > 0) {
      const bounds = L.latLngBounds(items.map((i) => [i.latitude, i.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [items, map]);
  return null;
}

const filters = [
  { id: "all", label: "All", icon: MapPin },
  { id: "restaurant", label: "Restaurants", icon: Utensils },
  { id: "bar", label: "Bars & Clubs", icon: Wine },
  { id: "live_music", label: "Live Music", icon: Music },
  { id: "event", label: "Events", icon: Calendar },
  { id: "movie", label: "Movies", icon: Film },
  { id: "experience", label: "Experiences", icon: Compass },
];

const Map = () => {
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: venues = [], isLoading: venuesLoading } = useVenues({ search: search || undefined, limit: 200 });
  const { data: events = [], isLoading: eventsLoading } = useEvents({ search: search || undefined, limit: 200 });

  const isLoading = venuesLoading && eventsLoading;

  // Merge venues + events (with coordinates) into unified MapItem list
  const allItems: MapItem[] = useMemo(() => {
    const venueItems: MapItem[] = venues
      .filter((v) => v.latitude && v.longitude)
      .map((v) => ({
        id: v.id,
        name: v.name,
        type: v.type,
        category: "venue" as const,
        slug: v.slug,
        city: v.city,
        latitude: Number(v.latitude),
        longitude: Number(v.longitude),
        description: v.short_description,
        rating: v.average_rating ? Number(v.average_rating) : null,
        reviewCount: v.review_count,
        image: v.images?.[0] ?? null,
      }));

    // Events: use their linked venue's coordinates
    const eventItems: MapItem[] = (events as any[])
      .filter((e) => e.venues?.latitude && e.venues?.longitude)
      .map((e) => ({
        id: e.id,
        name: e.name,
        type: e.event_type,
        category: "event" as const,
        slug: e.slug,
        city: e.venues?.city ?? "Berlin",
        latitude: Number(e.venues.latitude),
        longitude: Number(e.venues.longitude),
        description: e.short_description || e.description?.slice(0, 120),
        rating: null,
        reviewCount: null,
        image: e.images?.[0] ?? null,
        eventType: e.event_type,
      }));

    return [...venueItems, ...eventItems];
  }, [venues, events]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return allItems;
    return allItems.filter((item) => {
      const t = item.type.toLowerCase();
      if (activeFilter === "restaurant") return item.category === "venue" && (t === "restaurant" || t === "cafe");
      if (activeFilter === "bar") return item.category === "venue" && (t === "bar" || t === "club" || t === "beer garden");
      if (activeFilter === "live_music") return item.category === "venue" && (t === "live_music" || t === "live music");
      if (activeFilter === "event") return item.category === "event" && t !== "movie" && t !== "experience" && t !== "tour";
      if (activeFilter === "movie") return item.category === "event" && t === "movie";
      if (activeFilter === "experience") return item.category === "event" && (t === "experience" || t === "tour");
      return false;
    });
  }, [allItems, activeFilter]);

  const center: [number, number] = [52.52, 13.405];

  const getDetailLink = (item: MapItem) =>
    item.category === "event" ? `/event/${item.slug}` : `/venue/${item.slug}`;

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
                  placeholder="Search venues, events, movies..."
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
              <FitBounds items={filteredItems} />
              {filteredItems.map((item) => (
                <Marker
                  key={`${item.category}-${item.id}`}
                  position={[item.latitude, item.longitude]}
                  icon={createMapIcon(item, selectedItem?.id === item.id)}
                  eventHandlers={{ click: () => setSelectedItem(item) }}
                >
                  <Popup>
                    <div className="text-sm min-w-[180px]">
                      <h3 className="font-bold text-base mb-1" style={{ color: "#1a1a2e" }}>{item.name}</h3>
                      <p className="text-gray-500 text-xs capitalize mb-1">{item.type} • {item.city}</p>
                      {item.rating != null && (
                        <p className="text-xs mb-2" style={{ color: "#1a1a2e" }}>⭐ {item.rating.toFixed(1)} ({item.reviewCount} reviews)</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                      )}
                      <a href={getDetailLink(item)} className="text-xs font-medium text-purple-600 hover:underline">
                        View Details →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Selected item panel */}
          {selectedItem && (
            <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 glass-card p-4 animate-fade-in z-[1000]">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-medium text-muted-foreground capitalize">{selectedItem.type}</span>
              <h3 className="font-heading font-bold text-lg mb-1">{selectedItem.name}</h3>
              {selectedItem.description && (
                <p className="text-sm text-muted-foreground mb-2">{selectedItem.description}</p>
              )}
              <div className="flex items-center gap-2 mb-4">
                {selectedItem.rating != null && (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{selectedItem.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">{selectedItem.city}</span>
              </div>
              <div className="flex gap-2">
                <Link to={getDetailLink(selectedItem)} className="flex-1">
                  <Button variant="neon" size="sm" className="w-full">View Details</Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const query = encodeURIComponent(`${selectedItem.name} ${selectedItem.city}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                  }}
                >
                  Directions
                </Button>
              </div>
            </div>
          )}

          {/* Count badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 text-sm text-muted-foreground z-[1000]">
            📍 {filteredItems.length} places on map
          </div>
        </div>
      </main>
    </div>
  );
};

export default Map;
