import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Calendar, ArrowRight, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  type: "venue" | "event";
  category: string;
  city?: string;
  image?: string;
  matchReason?: string;
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showButton?: boolean;
  buttonLabel?: string;
  onSearch?: (query: string) => void;
  defaultCity?: string;
}

const recentSearchesKey = "ausly-recent-searches";

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(recentSearchesKey) || "[]").slice(0, 5);
  } catch { return []; }
}

function saveRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter(s => s !== query);
    recent.unshift(query);
    localStorage.setItem(recentSearchesKey, JSON.stringify(recent.slice(0, 5)));
  } catch {}
}

// Intent keywords → discover filters
const INTENT_MAP: Record<string, { type?: string; category?: string; label: string }> = {
  // Dining
  eat: { type: "restaurant", label: "Restaurants" },
  eating: { type: "restaurant", label: "Restaurants" },
  food: { type: "restaurant", label: "Restaurants" },
  dinner: { type: "restaurant", label: "Restaurants" },
  lunch: { type: "restaurant", label: "Restaurants" },
  restaurant: { type: "restaurant", label: "Restaurants" },
  restaurants: { type: "restaurant", label: "Restaurants" },
  brunch: { type: "restaurant", label: "Restaurants" },
  breakfast: { type: "restaurant", label: "Restaurants" },
  cafe: { type: "cafe", label: "Cafés" },
  coffee: { type: "cafe", label: "Cafés" },
  // Nightlife
  club: { type: "club", label: "Clubs" },
  clubs: { type: "club", label: "Clubs" },
  nightlife: { type: "club", label: "Nightlife" },
  party: { type: "club", label: "Nightlife" },
  dancing: { type: "club", label: "Clubs" },
  techno: { type: "club", label: "Techno clubs" },
  bar: { type: "bar", label: "Bars" },
  bars: { type: "bar", label: "Bars" },
  drinks: { type: "bar", label: "Bars" },
  cocktails: { type: "bar", label: "Cocktail bars" },
  cocktail: { type: "bar", label: "Cocktail bars" },
  speakeasy: { type: "bar", label: "Speakeasy bars" },
  // Events
  events: { category: "events", label: "Events" },
  event: { category: "events", label: "Events" },
  concert: { category: "events", label: "Concerts" },
  concerts: { category: "events", label: "Concerts" },
  festival: { category: "events", label: "Festivals" },
  festivals: { category: "events", label: "Festivals" },
  live: { category: "events", label: "Live music" },
  music: { type: "live_music", label: "Live music venues" },
  // Culture
  museum: { type: "culture", label: "Museums" },
  museums: { type: "culture", label: "Museums" },
  gallery: { type: "culture", label: "Galleries" },
  culture: { type: "culture", label: "Culture" },
  // Other
  cinema: { type: "cinema", label: "Cinemas" },
  movie: { type: "cinema", label: "Cinemas" },
  movies: { type: "cinema", label: "Cinemas" },
  film: { type: "cinema", label: "Cinemas" },
  sports: { type: "sports", label: "Sports" },
  fitness: { type: "sports", label: "Fitness" },
  tour: { type: "walking_tour", label: "Tours" },
  tours: { type: "walking_tour", label: "Tours" },
};

const CITY_ALIASES: Record<string, string> = {
  berlin: "Berlin",
  hamburg: "Hamburg",
  munich: "München",
  münchen: "München",
  munchen: "München",
  cologne: "Köln",
  köln: "Köln",
  koln: "Köln",
  frankfurt: "Frankfurt",
  düsseldorf: "Düsseldorf",
  dusseldorf: "Düsseldorf",
  leipzig: "Leipzig",
  stuttgart: "Stuttgart",
};

const CUISINE_KEYWORDS = [
  "italian", "japanese", "sushi", "thai", "indian", "chinese", "mexican",
  "korean", "vietnamese", "french", "german", "turkish", "greek", "pizza",
  "burger", "vegan", "vegetarian", "ramen", "tapas", "asian", "fusion",
  "mediterranean", "seafood", "steak",
];

interface ParsedIntent {
  venueType?: string;
  category?: string;
  city?: string;
  cuisine?: string;
  remainingTerms: string[];
  intentLabel?: string;
}

function parseQuery(raw: string): ParsedIntent {
  const words = raw.toLowerCase().trim().split(/\s+/);
  let venueType: string | undefined;
  let category: string | undefined;
  let city: string | undefined;
  let cuisine: string | undefined;
  let intentLabel: string | undefined;
  const remaining: string[] = [];

  // Also check multi-word phrases
  const phrase = words.join(" ");
  
  // Check for "in <city>" pattern
  const inCityMatch = phrase.match(/\bin\s+(berlin|hamburg|munich|münchen|munchen|cologne|köln|koln|frankfurt|düsseldorf|dusseldorf|leipzig|stuttgart)\b/i);
  if (inCityMatch) {
    city = CITY_ALIASES[inCityMatch[1].toLowerCase()];
  }

  for (const word of words) {
    // Skip "in" preposition
    if (word === "in" || word === "the" || word === "a" || word === "an" || word === "for" || word === "near" || word === "around") continue;
    
    // Check city
    if (!city && CITY_ALIASES[word]) {
      city = CITY_ALIASES[word];
      continue;
    }

    // Check intent
    if (!venueType && !category && INTENT_MAP[word]) {
      const intent = INTENT_MAP[word];
      venueType = intent.type;
      category = intent.category;
      intentLabel = intent.label;
      continue;
    }

    // Check cuisine
    if (!cuisine && CUISINE_KEYWORDS.includes(word)) {
      cuisine = word;
      continue;
    }

    remaining.push(word);
  }

  return { venueType, category, city, cuisine, remainingTerms: remaining, intentLabel };
}

export default function SearchWithSuggestions({
  placeholder = "Try 'bars in Berlin' or 'Italian food'...",
  className = "",
  inputClassName = "",
  showButton = true,
  buttonLabel = "Explore",
  onSearch,
  defaultCity,
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [smartSuggestion, setSmartSuggestion] = useState<{ label: string; path: string } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchDB = useCallback(async (term: string) => {
    if (term.length < 2) { setResults([]); setSmartSuggestion(null); return; }
    setLoading(true);

    const parsed = parseQuery(term);
    const searchCity = parsed.city || defaultCity;

    // Build a smart suggestion link for intent-based queries
    if (parsed.intentLabel) {
      const params = new URLSearchParams();
      if (parsed.venueType) params.set("type", parsed.venueType);
      if (parsed.category === "events") params.set("type", "events");
      if (searchCity) params.set("city", searchCity.toLowerCase());
      if (parsed.cuisine) params.set("search", parsed.cuisine);
      setSmartSuggestion({
        label: `Browse ${parsed.intentLabel}${searchCity ? ` in ${searchCity}` : ""}`,
        path: `/discover?${params.toString()}`,
      });
    } else {
      setSmartSuggestion(null);
    }

    try {
      // Build venue query with multi-field search
      let venueQuery = supabase
        .from("venues")
        .select("id, slug, name, type, city, cuisine, images, short_description")
        .eq("is_active", true)
        .limit(8);

      let eventQuery = supabase
        .from("events")
        .select("id, slug, name, event_type, images, short_description")
        .eq("is_active", true)
        .limit(5);

      // Apply city filter
      if (parsed.city) {
        venueQuery = venueQuery.ilike("city", `%${parsed.city}%`);
      }

      // Apply type filter
      if (parsed.venueType) {
        venueQuery = venueQuery.ilike("type", `%${parsed.venueType}%`);
      }

      // Apply cuisine filter
      if (parsed.cuisine) {
        venueQuery = venueQuery.ilike("cuisine", `%${parsed.cuisine}%`);
      }

      // For name search: use remaining terms + the full query for broader matching
      const nameTerms = parsed.remainingTerms.length > 0 ? parsed.remainingTerms : term.split(/\s+/);

      // Search venues — use OR across name, cuisine, short_description, type
      // Build individual word searches for better matching
      const venueSearchTerms = nameTerms.filter(t => t.length >= 2);
      
      if (venueSearchTerms.length > 0 && !parsed.venueType && !parsed.cuisine) {
        // Search with OR across multiple fields using each word
        const orFilters = venueSearchTerms.map(t => 
          `name.ilike.%${t}%,cuisine.ilike.%${t}%,short_description.ilike.%${t}%,type.ilike.%${t}%`
        ).join(",");
        venueQuery = venueQuery.or(orFilters);
      }

      if (venueSearchTerms.length > 0 && !parsed.category) {
        const orFilters = venueSearchTerms.map(t =>
          `name.ilike.%${t}%,event_type.ilike.%${t}%,short_description.ilike.%${t}%`
        ).join(",");
        eventQuery = eventQuery.or(orFilters);
      }

      // If searching for events category, skip venue-only queries
      const shouldSearchVenues = parsed.category !== "events";
      const shouldSearchEvents = !parsed.venueType || parsed.category === "events";

      const promises: Promise<any>[] = [];
      if (shouldSearchVenues) promises.push(venueQuery.then());
      if (shouldSearchEvents) promises.push(eventQuery.then());

      const queryResults = await Promise.all(promises);
      
      let venueResults: any[] = [];
      let eventResults: any[] = [];

      if (shouldSearchVenues && shouldSearchEvents) {
        venueResults = results[0]?.data || [];
        eventResults = results[1]?.data || [];
      } else if (shouldSearchVenues) {
        venueResults = results[0]?.data || [];
      } else {
        eventResults = results[0]?.data || [];
      }

      // Score and sort results by relevance
      const scoredVenues: SearchResult[] = venueResults.map((v: any) => {
        let score = 0;
        const nameLower = v.name.toLowerCase();
        const termLower = term.toLowerCase();
        
        // Exact name match
        if (nameLower === termLower) score += 100;
        // Name starts with query
        else if (nameLower.startsWith(termLower)) score += 50;
        // Name contains full query
        else if (nameLower.includes(termLower)) score += 30;
        // Individual words match
        else {
          for (const w of venueSearchTerms) {
            if (nameLower.includes(w)) score += 15;
          }
        }
        
        // Boost featured venues
        if (v.is_featured) score += 5;

        return {
          id: v.id,
          slug: v.slug,
          name: v.name,
          type: "venue" as const,
          category: v.type,
          city: v.city,
          image: v.images?.[0],
          matchReason: parsed.cuisine ? v.cuisine : undefined,
          _score: score,
        };
      });

      const scoredEvents: SearchResult[] = eventResults.map((e: any) => {
        let score = 0;
        const nameLower = e.name.toLowerCase();
        const termLower = term.toLowerCase();
        
        if (nameLower === termLower) score += 100;
        else if (nameLower.startsWith(termLower)) score += 50;
        else if (nameLower.includes(termLower)) score += 30;

        return {
          id: e.id,
          slug: e.slug,
          name: e.name,
          type: "event" as const,
          category: e.event_type,
          image: e.images?.[0],
          _score: score,
        };
      });

      // Combine, sort by score, take top 8
      const all = [...scoredVenues, ...scoredEvents]
        .sort((a: any, b: any) => (b._score || 0) - (a._score || 0))
        .slice(0, 8)
        .map(({ _score, ...rest }: any) => rest);

      setResults(all);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [defaultCity]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDB(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchDB]);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(result.name);
    setIsOpen(false);
    setQuery("");
    if (result.type === "venue") {
      navigate(`/venue/${result.slug}`);
    } else {
      navigate(`/event/${result.slug}`);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setIsOpen(false);
      
      // Use parsed intent for smarter navigation
      const parsed = parseQuery(query.trim());
      const params = new URLSearchParams();
      
      if (parsed.venueType) params.set("type", parsed.venueType);
      if (parsed.category === "events") params.set("type", "events");
      
      const searchCity = parsed.city || defaultCity;
      if (searchCity) params.set("city", searchCity.toLowerCase());
      
      // Put remaining terms + cuisine as search
      const searchTerms = [...parsed.remainingTerms];
      if (parsed.cuisine) searchTerms.push(parsed.cuisine);
      if (searchTerms.length > 0) {
        params.set("search", searchTerms.join(" "));
      } else if (!parsed.venueType && !parsed.category) {
        params.set("search", query.trim());
      }

      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/discover?${params.toString()}`);
      }
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + (smartSuggestion ? 1 : 0);
    if (e.key === "Enter") {
      if (smartSuggestion && selectedIndex === 0) {
        saveRecentSearch(query.trim());
        setIsOpen(false);
        setQuery("");
        navigate(smartSuggestion.path);
      } else if (selectedIndex >= (smartSuggestion ? 1 : 0) && selectedIndex < totalItems) {
        handleSelect(results[selectedIndex - (smartSuggestion ? 1 : 0)]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div ref={wrapperRef} className={`relative z-[120] isolate ${className}`}>
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-border/50">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={`w-full pl-12 pr-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base ${inputClassName}`}
          />
        </div>
        {showButton && (
          <Button
            onClick={handleSearch}
            className="rounded-xl px-6 py-3 h-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            {buttonLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
       {showDropdown && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-[130] overflow-hidden max-h-96 overflow-y-auto">
          {/* Recent searches when no query */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-muted-foreground font-medium px-2 mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recent
              </p>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(s); searchDB(s); }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && query.length >= 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          )}

          {/* Smart suggestion */}
          {!loading && query.length >= 2 && smartSuggestion && (
            <button
              onClick={() => {
                saveRecentSearch(query.trim());
                setIsOpen(false);
                setQuery("");
                navigate(smartSuggestion.path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border/50 transition-colors ${
                selectedIndex === 0 ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{smartSuggestion.label}</p>
                <p className="text-[11px] text-muted-foreground">Browse all matching results</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
            </button>
          )}

          {/* Results */}
          {!loading && query.length >= 2 && results.length > 0 && (
            <div className="p-2">
              {results.map((r, i) => {
                const itemIndex = i + (smartSuggestion ? 1 : 0);
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      itemIndex === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    {r.image ? (
                      <img src={r.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {r.type === "venue" ? <MapPin className="w-4 h-4 text-muted-foreground" /> : <Calendar className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {r.matchReason ? `${r.matchReason} · ` : ""}{r.category}{r.city ? ` · ${r.city}` : ""}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
              {/* Search all link */}
              <button
                onClick={handleSearch}
                className="w-full text-center py-2.5 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors mt-1"
              >
                See all results for "{query}"
              </button>
            </div>
          )}

          {/* No results */}
          {!loading && query.length >= 2 && results.length === 0 && !smartSuggestion && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              <button
                onClick={handleSearch}
                className="text-sm text-primary font-medium mt-1 hover:underline"
              >
                Search all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
