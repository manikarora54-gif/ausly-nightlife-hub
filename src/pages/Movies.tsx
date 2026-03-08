import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Clock, Film } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredMovies = movies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="mb-8">
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
            {searchQuery
              ? `No movies found matching "${searchQuery}"`
              : "No movies available right now. Check back soon!"}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Movies;
