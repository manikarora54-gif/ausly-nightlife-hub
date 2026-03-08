import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Clock } from "lucide-react";

const mockMovies = [
  {
    id: "1",
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=300&h=450&fit=crop",
    rating: 8.8,
    genre: "Sci-Fi",
    duration: "166 min",
    releaseDate: "2024",
  },
  {
    id: "2",
    title: "Oppenheimer",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop",
    rating: 8.5,
    genre: "Drama",
    duration: "180 min",
    releaseDate: "2023",
  },
  {
    id: "3",
    title: "The Batman",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300&h=450&fit=crop",
    rating: 7.8,
    genre: "Action",
    duration: "176 min",
    releaseDate: "2022",
  },
  {
    id: "4",
    title: "Everything Everywhere All at Once",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 7.9,
    genre: "Sci-Fi",
    duration: "139 min",
    releaseDate: "2022",
  },
  {
    id: "5",
    title: "Poor Things",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop",
    rating: 8.0,
    genre: "Comedy",
    duration: "141 min",
    releaseDate: "2024",
  },
  {
    id: "6",
    title: "Killers of the Flower Moon",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=450&fit=crop",
    rating: 7.7,
    genre: "Drama",
    duration: "206 min",
    releaseDate: "2023",
  },
  {
    id: "7",
    title: "Spider-Man: Across the Spider-Verse",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop",
    rating: 8.7,
    genre: "Animation",
    duration: "140 min",
    releaseDate: "2023",
  },
  {
    id: "8",
    title: "Anatomy of a Fall",
    poster: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=300&h=450&fit=crop",
    rating: 7.8,
    genre: "Thriller",
    duration: "152 min",
    releaseDate: "2023",
  },
  {
    id: "9",
    title: "Past Lives",
    poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&h=450&fit=crop",
    rating: 7.9,
    genre: "Romance",
    duration: "106 min",
    releaseDate: "2023",
  },
  {
    id: "10",
    title: "The Zone of Interest",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop",
    rating: 7.4,
    genre: "Drama",
    duration: "105 min",
    releaseDate: "2024",
  },
  {
    id: "11",
    title: "Godzilla Minus One",
    poster: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=300&h=450&fit=crop",
    rating: 7.8,
    genre: "Action",
    duration: "125 min",
    releaseDate: "2024",
  },
  {
    id: "12",
    title: "The Holdovers",
    poster: "https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=300&h=450&fit=crop",
    rating: 7.9,
    genre: "Comedy",
    duration: "133 min",
    releaseDate: "2023",
  },
];

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMovies = mockMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold mb-4">Now Showing</h1>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {movie.rating}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{movie.genre}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {movie.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No movies found matching "{searchQuery}"
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Movies;
