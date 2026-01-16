import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CinemaCard from "@/components/movies/CinemaCard";
import { useState } from "react";
import MoviesSearchBar from "@/components/movies/MoviesSearchBar";

const mockCinemas = [
  { id: 1, name: "Berlin Filmhaus", address: "Potsdamer Str. 2", rating: 4.5, city: "Berlin" },
  { id: 2, name: "Munich Kino Center", address: "Marienplatz 1", rating: 4.2, city: "Munich" },
];

const Cinemas = () => {
  const [query, setQuery] = useState("");
  // Filter on name/city
  const results = mockCinemas.filter(
    c => c.name.toLowerCase().includes(query.toLowerCase()) || c.city.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex flex-col gap-4">
        <h1 className="text-3xl font-bold mb-2">Cinemas Near You</h1>
        <MoviesSearchBar query={query} setQuery={setQuery} onSearch={() => {}} />
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((cinema) => <CinemaCard key={cinema.id} cinema={cinema} />)}
          {results.length === 0 && <div className="text-muted-foreground">No cinemas found.</div>}
        </div>
      </main>
      <Footer />
    </>
  );
};
export default Cinemas;
