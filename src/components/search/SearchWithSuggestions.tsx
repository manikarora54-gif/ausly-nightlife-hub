import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Calendar, ArrowRight, Clock } from "lucide-react";
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

export default function SearchWithSuggestions({
  placeholder = "Search restaurants, events, clubs...",
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
    if (term.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const [{ data: venues }, { data: events }] = await Promise.all([
        supabase
          .from("venues")
          .select("id, slug, name, type, city, images")
          .eq("is_active", true)
          .ilike("name", `%${term}%`)
          .limit(5),
        supabase
          .from("events")
          .select("id, slug, name, event_type, images")
          .eq("is_active", true)
          .ilike("name", `%${term}%`)
          .limit(3),
      ]);

      const mapped: SearchResult[] = [
        ...(venues || []).map(v => ({
          id: v.id,
          slug: v.slug,
          name: v.name,
          type: "venue" as const,
          category: v.type,
          city: v.city,
          image: v.images?.[0],
        })),
        ...(events || []).map(e => ({
          id: e.id,
          slug: e.slug,
          name: e.name,
          type: "event" as const,
          category: e.event_type,
          image: e.images?.[0],
        })),
      ];
      setResults(mapped);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDB(query), 300);
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
      if (onSearch) {
        onSearch(query.trim());
      } else {
        const params = new URLSearchParams({ search: query.trim() });
        if (defaultCity) params.set("city", defaultCity.toLowerCase());
        navigate(`/discover?${params.toString()}`);
      }
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showDropdown = isOpen && (query.length >= 2 || recentSearches.length > 0);

  return (
    <div ref={wrapperRef} className={`relative z-50 ${className}`}>
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
         <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-[9999] overflow-hidden max-h-80 overflow-y-auto">
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

          {/* Results */}
          {!loading && query.length >= 2 && results.length > 0 && (
            <div className="p-2">
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    i === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
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
                      {r.category}{r.city ? ` · ${r.city}` : ""}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
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
          {!loading && query.length >= 2 && results.length === 0 && (
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
