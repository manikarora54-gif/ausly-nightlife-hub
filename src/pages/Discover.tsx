import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Star, Grid3X3, List, Loader2, SlidersHorizontal,
  Utensils, Wine, Music, Ticket, Film, PartyPopper, X, ChevronDown,
  ArrowUpDown, Clock, TrendingUp, Sparkles,
} from "lucide-react";
import { useVenues } from "@/hooks/useVenues";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Category config ─── */
const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles, types: [] },
  { id: "restaurants", label: "Restaurants", icon: Utensils, types: ["restaurant", "Restaurant", "cafe", "Cafe"] },
  { id: "bars", label: "Bars", icon: Wine, types: ["bar", "Bar", "Beer Garden"] },
  { id: "clubs", label: "Clubs", icon: Music, types: ["club", "Club"] },
  { id: "events", label: "Events", icon: Ticket, types: ["__events__"] },
  { id: "movies", label: "Movies", icon: Film, types: ["__movies__"] },
] as const;

const CITIES = ["All Cities", "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Düsseldorf", "Stuttgart", "Leipzig"];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured first", icon: TrendingUp },
  { value: "rating", label: "Highest rated", icon: Star },
  { value: "newest", label: "Newest", icon: Clock },
];

/* ─── Component ─── */
const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("type") || "all";
  const initialCity = searchParams.get("city") || "";
  const initialSearch = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(initialCity ? initialCity.charAt(0).toUpperCase() + initialCity.slice(1) : "All Cities");
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (activeCategory !== "all") params.type = activeCategory;
    if (selectedCity !== "All Cities") params.city = selectedCity.toLowerCase();
    if (search) params.q = search;
    setSearchParams(params, { replace: true });
  }, [activeCategory, selectedCity, search, setSearchParams]);

  const cityFilter = selectedCity !== "All Cities" ? selectedCity : undefined;

  const { data: venues = [], isLoading: venuesLoading } = useVenues({
    search: search || undefined,
    city: cityFilter,
  });

  const { data: events = [], isLoading: eventsLoading } = useEvents({
    search: search || undefined,
    city: cityFilter,
    upcoming: true,
  });

  const currentCat = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const isEventsTab = activeCategory === "events";
  const isMoviesTab = activeCategory === "movies";

  /* ─── Build unified items ─── */
  const items = useMemo(() => {
    let results: any[] = [];

    if (isEventsTab) {
      results = events
        .filter(e => e.event_type !== "movie")
        .map(e => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          type: "event",
          subtitle: e.event_type,
          location: (e as any).venues?.city || "",
          address: (e as any).venues?.name || "",
          rating: null,
          reviewCount: null,
          price: e.ticket_price ? `€${e.ticket_price}` : null,
          image: e.images?.[0],
          featured: e.is_featured,
          date: e.start_date,
          link: `/event/${e.slug}`,
          genre: e.genre,
        }));
    } else if (isMoviesTab) {
      results = events
        .filter(e => e.event_type === "movie")
        .map(e => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          type: "movie",
          subtitle: e.genre || "Movie",
          location: "",
          address: "",
          rating: null,
          reviewCount: null,
          price: null,
          image: e.images?.[0],
          featured: e.is_featured,
          date: e.start_date,
          link: `/event/${e.slug}`,
          genre: e.genre,
        }));
    } else {
      const filtered = activeCategory === "all"
        ? venues
        : venues.filter(v => currentCat.types.some(t => t.toLowerCase() === v.type.toLowerCase()));

      results = filtered.map(v => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        type: "venue",
        subtitle: v.cuisine || v.type,
        location: v.city,
        address: v.address,
        rating: v.average_rating,
        reviewCount: v.review_count,
        price: v.price_range ? "€".repeat(v.price_range) : null,
        image: v.images?.[0],
        featured: v.is_featured,
        date: null,
        link: `/venue/${v.slug}`,
        features: v.features,
      }));
    }

    // Sort
    if (sortBy === "rating") {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      results.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } else {
      results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return results;
  }, [venues, events, activeCategory, currentCat, isEventsTab, isMoviesTab, sortBy]);

  const isLoading = venuesLoading || eventsLoading;

  const clearFilters = () => {
    setSearch("");
    setSelectedCity("All Cities");
    setActiveCategory("all");
    setSortBy("featured");
  };

  const hasActiveFilters = search || selectedCity !== "All Cities" || activeCategory !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Discover" },
            ]}
          />

          {/* Hero Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
              Discover <span className="gradient-text">{selectedCity === "All Cities" ? "Germany" : selectedCity}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Explore the best restaurants, bars, clubs, events, and movies across Germany's top cities.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-card p-4 mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={
                    isEventsTab ? "Search events, artists, venues..." :
                    isMoviesTab ? "Search movies, genres..." :
                    "Search venues, cuisine, location..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* City Select */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full md:w-[180px] bg-muted/50 border-border/50">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] bg-muted/50 border-border/50">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="hidden md:flex border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {activeCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {currentCat.label}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setActiveCategory("all")} />
                  </Badge>
                )}
                {selectedCity !== "All Cities" && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {selectedCity}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCity("All Cities")} />
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    "{search}"
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch("")} />
                  </Badge>
                )}
                <button onClick={clearFilters} className="text-xs text-primary hover:underline ml-1">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Searching..." : `${items.length} result${items.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-heading font-bold text-2xl mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            /* Results Grid */
            <div className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}>
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`group glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300 animate-fade-in ${
                    viewMode === "list" ? "flex flex-row" : ""
                  }`}
                  style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${viewMode === "list" ? "w-52 flex-shrink-0" : "h-52"}`}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Film className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.featured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                          Featured
                        </span>
                      )}
                      {item.type === "event" && item.date && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground">
                          {format(new Date(item.date), "MMM d")}
                        </span>
                      )}
                    </div>

                    {item.price && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-background/80 backdrop-blur-sm text-foreground">
                        {item.price}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      {item.rating && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-sm flex-shrink-0">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{Number(item.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{item.subtitle}</p>

                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-2">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{item.address ? `${item.address}, ${item.location}` : item.location}</span>
                      </div>
                    )}

                    {item.type === "movie" && item.genre && (
                      <div className="mt-auto pt-2">
                        <Badge variant="outline" className="text-[10px]">{item.genre}</Badge>
                      </div>
                    )}

                    {item.features && item.features.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-auto pt-3">
                        {item.features.slice(0, 3).map((f: string) => (
                          <Badge key={f} variant="outline" className="text-[10px] border-border/50">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Discover;
