import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MoviesSearchBar from "@/components/movies/MoviesSearchBar";
import MovieCard from "@/components/movies/MovieCard";
import { useState } from "react";

const mockMovies = [
  { id: 1, title: "Oppenheimer", poster: "", rating: 4.7, genres: ["Drama"] },
  { id: 2, title: "Barbie", poster: "", rating: 4.2, genres: ["Comedy"] },
];

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  // Filter local mock. IRL would call API.
  const results = mockMovies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col gap-4">
        <h1 className="text-3xl font-bold mb-2">Find Movies Near You</h1>
        <MoviesSearchBar query={query} setQuery={setQuery} onSearch={() => {}} />
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          {results.length === 0 && <div className="text-muted-foreground">No movies found.</div>}
        </div>
      </main>
      <Footer />
    </>
  );
};
export default MovieSearch;
