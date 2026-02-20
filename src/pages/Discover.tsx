import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  Grid3X3, 
  List,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useVenues } from "@/hooks/useVenues";
import { useEvents } from "@/hooks/useEvents";

const tabs = [
  { id: "restaurants", label: "Restaurants", types: ["restaurant", "Restaurant", "cafe"] },
  { id: "bars", label: "Bars & Clubs", types: ["bar", "Bar", "club", "Club", "Beer Garden"] },
  { id: "events", label: "Events", types: [] },
  { id: "experiences", label: "Experiences", types: ["live_music", "Live Music", "cinema"] },
];

const Discover = () => {
  const [searchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "restaurants";
  const searchQuery = searchParams.get("q") || "";
  const cityFilter = searchParams.get("city") || "";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const isEventsTab = activeType === "events";
  const currentTab = tabs.find(t => t.id === activeType) || tabs[0];

  useEffect(() => {
    if (searchQuery) setSearch(searchQuery);
    if (cityFilter) {
      const cityName = cityFilter.charAt(0).toUpperCase() + cityFilter.slice(1);
      setSearch(cityName);
    }
  }, [searchQuery, cityFilter]);

  const { data: venues = [], isLoading: venuesLoading } = useVenues({
    search: search || undefined,
    city: cityFilter || undefined,
  });

  const { data: events = [], isLoading: eventsLoading } = useEvents({
    search: search || undefined,
    city: cityFilter || undefined,
    upcoming: true,
  });

  const isLoading = isEventsTab ? eventsLoading : venuesLoading;

  // Filter venues by current tab's types
  const filteredVenues = venues.filter(v => 
    currentTab.types.some(t => t.toLowerCase() === v.type.toLowerCase())
  );

  const filteredEvents = events;

  const items = isEventsTab
    ? filteredEvents.map(e => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        subtitle: e.event_type,
        location: (e as any).venues?.city || "",
        neighborhood: (e as any).venues?.name || "",
        rating: null,
        price: e.ticket_price ? `€${e.ticket_price}` : "Free",
        image: e.images?.[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
        tag: e.is_featured ? "Featured" : null,
        link: `/event/${e.slug}`,
      }))
    : filteredVenues.map(v => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        subtitle: `${v.cuisine || v.type} • ${"€".repeat(v.price_range || 2)}`,
        location: v.city,
        neighborhood: v.address,
        rating: v.average_rating,
        price: "€".repeat(v.price_range || 2),
        image: v.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
        tag: v.is_featured ? "Featured" : null,
        link: `/venue/${v.slug}`,
      }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: currentTab.label },
            ]}
          />

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/discover?type=${tab.id}${cityFilter ? `&city=${cityFilter}` : ""}`}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeType === tab.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search venues, cuisine, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12"
                />
              </div>

              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {items.length} results
          </p>

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {items.map((item, index) => (
                  <Link
                    key={item.id}
                    to={item.link}
                    className={`group glass-card overflow-hidden hover-glow animate-fade-in ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "h-48"}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      
                      {item.tag && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                          {item.tag}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        {item.rating && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-sm flex-shrink-0">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {Number(item.rating).toFixed(1)}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.subtitle}
                      </p>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {items.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Discover;
