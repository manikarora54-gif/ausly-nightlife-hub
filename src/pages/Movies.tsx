import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Film, Clapperboard, Theater, Swords, Laugh, Heart, Ghost, Rocket, Baby, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const GENRE_KEYWORDS: Record<string, string[]> = {
  Action: ["action", "fight", "battle", "war", "combat", "thriller", "spy", "chase"],
  Comedy: ["comedy", "funny", "humor", "humour", "laugh", "comedic", "satire"],
  Drama: ["drama", "dramatic", "emotional", "family drama"],
  "Sci-Fi": ["sci-fi", "science fiction", "space", "alien", "futuristic", "dystop"],
  Horror: ["horror", "scary", "terror", "haunted", "zombie", "slasher"],
  Romance: ["romance", "romantic", "love story", "love"],
  Animation: ["animation", "animated", "anime", "cartoon", "pixar"],
  Thriller: ["thriller", "suspense", "mystery", "crime", "detective"],
};

const GENRE_ICONS: Record<string, any> = {
  All: Clapperboard,
  Action: Swords,
  Comedy: Laugh,
  Drama: Theater,
  "Sci-Fi": Rocket,
  Horror: Ghost,
  Romance: Heart,
  Animation: Baby,
  Thriller: Sparkles,
};

function detectGenre(movie: { name: string; description: string | null; short_description: string | null }): string {
  const text = `${movie.name} ${movie.description || ""} ${movie.short_description || ""}`.toLowerCase();
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return genre;
  }
  return "Other";
}

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "movie")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const moviesWithGenre = useMemo(
    () => movies.map((m) => ({ ...m, genre: detectGenre(m) })),
    [movies]
  );

  // Build genre tabs from actual data
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    moviesWithGenre.forEach((m) => {
      counts[m.genre] = (counts[m.genre] || 0) + 1;
    });
    return counts;
  }, [moviesWithGenre]);

  const genres = ["All", ...Object.keys(GENRE_KEYWORDS).filter((g) => genreCounts[g])];
  if (genreCounts["Other"]) genres.push("Other");

  const filteredMovies = moviesWithGenre.filter((movie) => {
    const matchesSearch = movie.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = activeGenre === "All" || movie.genre === activeGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Movies" },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Now Showing</h1>
          <p className="text-muted-foreground mb-4">
            Movies currently in theaters across Germany · Updated daily
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Genre Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {genres.map((genre) => {
            const Icon = GENRE_ICONS[genre] || Film;
            const count = genre === "All" ? movies.length : genreCounts[genre] || 0;
            return (
              <Button
                key={genre}
                variant={activeGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveGenre(genre)}
                className="flex-shrink-0 gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {genre}
                <span className="text-xs opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[2/3] w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Link key={movie.id} to={`/event/${movie.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative aspect-[2/3] overflow-hidden bg-muted flex items-center justify-center">
                    {movie.images && movie.images.length > 0 ? (
                      <img
                        src={movie.images[0]}
                        alt={movie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Film className="h-12 w-12" />
                        <span className="text-xs text-center px-2">{movie.name}</span>
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[10px]">
                      {movie.genre}
                    </Badge>
                    {movie.ticket_price && (
                      <Badge className="absolute top-2 right-2 bg-primary">
                        €{movie.ticket_price}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{movie.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {movie.short_description || movie.description?.substring(0, 100)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredMovies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || activeGenre !== "All"
              ? `No movies found${searchQuery ? ` matching "${searchQuery}"` : ""}${activeGenre !== "All" ? ` in ${activeGenre}` : ""}`
              : "No movies available right now. Check back soon!"}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Movies;
