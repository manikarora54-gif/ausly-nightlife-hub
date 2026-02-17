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
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";

const categoryLabels: Record<string, string> = {
  restaurants: "Restaurants",
  bars: "Bars & Clubs",
  events: "Events",
  experiences: "Experiences",
};

const cuisines = ["All", "German", "Italian", "Japanese", "Mexican", "Indian", "Mediterranean", "Asian Fusion"];
const ratings = ["Any", "4.5+", "4.0+", "3.5+"];

const mockVenues = [
  // Restaurants
  {
    id: 1,
    name: "Nobelhart & Schmutzig",
    type: "restaurants",
    cuisine: "German",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    rating: 4.9,
    price: "€€€€",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    tag: "Michelin Star",
  },
  {
    id: 3,
    name: "Tantris",
    type: "restaurants",
    cuisine: "Fine Dining",
    location: "Munich",
    neighborhood: "Schwabing",
    rating: 4.8,
    price: "€€€€",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    tag: "2 Michelin Stars",
  },
  {
    id: 6,
    name: "Katz Orange",
    type: "restaurants",
    cuisine: "Farm-to-Table",
    location: "Berlin",
    neighborhood: "Mitte",
    rating: 4.5,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
    tag: "Sustainable",
  },
  {
    id: 9,
    name: "Tim Raue",
    type: "restaurants",
    cuisine: "Asian Fusion",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    rating: 4.8,
    price: "€€€€",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    tag: "2 Michelin Stars",
  },
  {
    id: 10,
    name: "Schneider Bräuhaus",
    type: "restaurants",
    cuisine: "German",
    location: "Munich",
    neighborhood: "Altstadt",
    rating: 4.6,
    price: "€€",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop",
    tag: "Traditional",
  },
  {
    id: 11,
    name: "Fischers Fritz",
    type: "restaurants",
    cuisine: "Seafood",
    location: "Berlin",
    neighborhood: "Mitte",
    rating: 4.7,
    price: "€€€€",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop",
    tag: "Michelin Star",
  },
  {
    id: 12,
    name: "Zur Letzten Instanz",
    type: "restaurants",
    cuisine: "German",
    location: "Berlin",
    neighborhood: "Mitte",
    rating: 4.4,
    price: "€€",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    tag: "Historic",
  },
  {
    id: 13,
    name: "Vier Jahreszeiten",
    type: "restaurants",
    cuisine: "International",
    location: "Hamburg",
    neighborhood: "Neustadt",
    rating: 4.8,
    price: "€€€€",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    tag: "Luxury",
  },
  {
    id: 14,
    name: "Zur Haxe",
    type: "restaurants",
    cuisine: "German",
    location: "Frankfurt",
    neighborhood: "Altstadt",
    rating: 4.5,
    price: "€€",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop",
    tag: "Local Favorite",
  },
  // Bars & Clubs
  {
    id: 2,
    name: "Berghain",
    type: "bars",
    cuisine: "Club",
    location: "Berlin",
    neighborhood: "Friedrichshain",
    rating: 4.9,
    price: "€€",
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&h=400&fit=crop",
    tag: "Legendary",
  },
  {
    id: 4,
    name: "Buck and Breck",
    type: "bars",
    cuisine: "Speakeasy",
    location: "Berlin",
    neighborhood: "Mitte",
    rating: 4.7,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
    tag: "Hidden Gem",
  },
  {
    id: 5,
    name: "Watergate",
    type: "bars",
    cuisine: "Club",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    rating: 4.6,
    price: "€€",
    image: "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=600&h=400&fit=crop",
    tag: "River Views",
  },
  {
    id: 15,
    name: "Tresor",
    type: "bars",
    cuisine: "Club",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    rating: 4.7,
    price: "€€",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    tag: "Techno Icon",
  },
  {
    id: 16,
    name: "Skyline Bar 20up",
    type: "bars",
    cuisine: "Rooftop Bar",
    location: "Hamburg",
    neighborhood: "Neustadt",
    rating: 4.8,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
    tag: "Best Views",
  },
  {
    id: 17,
    name: "Bar Tausend",
    type: "bars",
    cuisine: "Cocktail Bar",
    location: "Berlin",
    neighborhood: "Mitte",
    rating: 4.6,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
    tag: "Exclusive",
  },
  {
    id: 18,
    name: "P1 Club",
    type: "bars",
    cuisine: "Club",
    location: "Munich",
    neighborhood: "Maxvorstadt",
    rating: 4.7,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&h=400&fit=crop",
    tag: "VIP",
  },
  {
    id: 19,
    name: "Zum Schneider",
    type: "bars",
    cuisine: "Beer Hall",
    location: "Munich",
    neighborhood: "Altstadt",
    rating: 4.5,
    price: "€€",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop",
    tag: "Traditional",
  },
  {
    id: 20,
    name: "Clouds Heaven's Bar",
    type: "bars",
    cuisine: "Rooftop Bar",
    location: "Frankfurt",
    neighborhood: "Innenstadt",
    rating: 4.6,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
    tag: "Sky High",
  },
  {
    id: 21,
    name: "Sisyphos",
    type: "bars",
    cuisine: "Club",
    location: "Berlin",
    neighborhood: "Friedrichshain",
    rating: 4.8,
    price: "€€",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    tag: "Open Air",
  },
  // Events
  {
    id: 7,
    name: "Techno Paradise Festival",
    type: "events",
    cuisine: "Electronic",
    location: "Berlin",
    neighborhood: "Multiple Venues",
    rating: 4.8,
    price: "€€",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    tag: "This Weekend",
  },
  {
    id: 22,
    name: "Berlin Jazz Festival",
    type: "events",
    cuisine: "Jazz",
    location: "Berlin",
    neighborhood: "Multiple Venues",
    rating: 4.7,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=400&fit=crop",
    tag: "Multi-Day",
  },
  {
    id: 23,
    name: "Oktoberfest Afterparty",
    type: "events",
    cuisine: "Festival",
    location: "Munich",
    neighborhood: "Theresienwiese",
    rating: 4.9,
    price: "€€",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop",
    tag: "Popular",
  },
  {
    id: 24,
    name: "Hamburg Music Week",
    type: "events",
    cuisine: "Music Festival",
    location: "Hamburg",
    neighborhood: "Multiple Venues",
    rating: 4.6,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    tag: "Week Long",
  },
  {
    id: 25,
    name: "Wine & Dine Night",
    type: "events",
    cuisine: "Food & Wine",
    location: "Frankfurt",
    neighborhood: "Sachsenhausen",
    rating: 4.8,
    price: "€€€€",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    tag: "Gourmet",
  },
  // Experiences
  {
    id: 8,
    name: "Wine Tasting Experience",
    type: "experiences",
    cuisine: "Wine",
    location: "Munich",
    neighborhood: "Altstadt",
    rating: 4.9,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    tag: "Expert Led",
  },
  {
    id: 26,
    name: "Berlin Street Art Tour",
    type: "experiences",
    cuisine: "Cultural",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    rating: 4.7,
    price: "€€",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
    tag: "Walking Tour",
  },
  {
    id: 27,
    name: "Cocktail Masterclass",
    type: "experiences",
    cuisine: "Mixology",
    location: "Hamburg",
    neighborhood: "Neustadt",
    rating: 4.8,
    price: "€€€",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
    tag: "Hands-On",
  },
  {
    id: 28,
    name: "Brewery Tour & Tasting",
    type: "experiences",
    cuisine: "Beer",
    location: "Munich",
    neighborhood: "Maxvorstadt",
    rating: 4.6,
    price: "€€",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=400&fit=crop",
    tag: "Local Brews",
  },
];

const Discover = () => {
  const [searchParams] = useSearchParams();
  const activeType = searchParams.get("type") || "restaurants";
  const searchQuery = searchParams.get("q") || "";
  const cityFilter = searchParams.get("city") || "";
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(searchQuery);
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedRating, setSelectedRating] = useState("Any");
  const [showFilters, setShowFilters] = useState(false);

  // Update search when URL param changes
  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery);
    }
    if (cityFilter) {
      // Auto-filter by city when coming from footer
      const cityName = cityFilter.charAt(0).toUpperCase() + cityFilter.slice(1);
      setSearch(cityName);
    }
  }, [searchQuery, cityFilter]);

  const filteredVenues = mockVenues.filter((venue) => {
    const matchesTab = venue.type === activeType;
    const matchesSearch = venue.name.toLowerCase().includes(search.toLowerCase()) ||
                         venue.location.toLowerCase().includes(search.toLowerCase()) ||
                         venue.cuisine.toLowerCase().includes(search.toLowerCase()) ||
                         venue.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine = selectedCuisine === "All" || venue.cuisine === selectedCuisine;
    const matchesCity = !cityFilter || venue.location.toLowerCase() === cityFilter.toLowerCase();
    
    return matchesTab && matchesSearch && matchesCuisine && matchesCity;
  });

  const currentCategory = categoryLabels[activeType] || "Discover";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: currentCategory },
            ]}
          />

          {/* Search & Filters */}
          <div className="glass-card p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
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

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {/* View Mode */}
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

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                {/* Cuisine Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Cuisine</label>
                  <div className="flex flex-wrap gap-2">
                    {cuisines.slice(0, 4).map((cuisine) => (
                      <Button
                        key={cuisine}
                        variant={selectedCuisine === cuisine ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedCuisine(cuisine)}
                      >
                        {cuisine}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {ratings.map((rating) => (
                      <Button
                        key={rating}
                        variant={selectedRating === rating ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedRating(rating)}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredVenues.length} results
          </p>

          {/* Results Grid */}
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredVenues.map((venue, index) => (
              <Link
                key={venue.id}
                to={`/venue/${venue.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                className={`group glass-card overflow-hidden hover-glow animate-fade-in ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : "h-48"}`}>
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  
                  {/* Tag */}
                  {venue.tag && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                      {venue.tag}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                      {venue.name}
                    </h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-sm flex-shrink-0">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {venue.rating}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {venue.cuisine} • {venue.price}
                  </p>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {venue.neighborhood}, {venue.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredVenues.length === 0 && (
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Discover;
