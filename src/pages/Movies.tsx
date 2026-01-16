import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MovieCard from "@/components/movies/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const mockMovies = [
  { id: 1, title: "Neon Nights", rating: 4.6, runtime: 120, image: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=600&h=400&fit=crop", synopsis: "A neon-lit adventure through the city's night life." },
  { id: 2, title: "Midnight Groove", rating: 4.3, runtime: 98, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop", synopsis: "An intimate look at underground music scenes." },
  { id: 3, title: "City Lights", rating: 4.8, runtime: 110, image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&h=400&fit=crop", synopsis: "Romance and drama under the city skyline." },
];

const Movies = () => {
  const [query, setQuery] = useState("");
  const filtered = mockMovies.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-2">Movies</h1>
            <p className="text-muted-foreground">Find showtimes near you and book cinema tickets.</p>
          </div>

          <div className="max-w-4xl mx-auto flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, e.g. Neon Nights"
                className="pl-10"
              />
            </div>
            <Button variant="neon">Search</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Movies;
