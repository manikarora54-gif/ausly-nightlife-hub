import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar, MapPin } from "lucide-react";

const mockMovies: Record<string, {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  genre: string;
  duration: string;
  releaseDate: string;
  description: string;
  director: string;
  cast: string[];
}> = {
  "1": {
    id: "1",
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=1200&h=600&fit=crop",
    rating: 8.8,
    genre: "Sci-Fi",
    duration: "166 min",
    releaseDate: "2024",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
  },
  "2": {
    id: "2",
    title: "Oppenheimer",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=600&fit=crop",
    rating: 8.5,
    genre: "Drama",
    duration: "180 min",
    releaseDate: "2023",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Robert Downey Jr."],
  },
};

const mockShowtimes = [
  { id: "st1", cinema: "CineStar IMAX", time: "14:00", format: "IMAX", price: 18 },
  { id: "st2", cinema: "CineStar IMAX", time: "17:30", format: "IMAX", price: 18 },
  { id: "st3", cinema: "Zoo Palast", time: "15:00", format: "2D", price: 12 },
  { id: "st4", cinema: "Zoo Palast", time: "20:00", format: "2D", price: 14 },
  { id: "st5", cinema: "Kino International", time: "19:00", format: "2D", price: 11 },
];

const Movie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const movie = mockMovies[id || "1"] || mockMovies["1"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero backdrop */}
      <div className="relative h-[40vh] overflow-hidden mt-16">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <main className="container mx-auto px-4 -mt-32 relative z-10">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Movies", href: "/movies" },
            { label: movie.title },
          ]}
        />
        
        <div className="grid md:grid-cols-[300px,1fr] gap-8 mt-4">
          {/* Poster */}
          <div className="hidden md:block">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {movie.rating}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {movie.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {movie.releaseDate}
                </span>
                <Badge>{movie.genre}</Badge>
              </div>
            </div>

            <p className="text-lg text-muted-foreground">{movie.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Director</span>
                <p className="font-medium">{movie.director}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cast</span>
                <p className="font-medium">{movie.cast.join(", ")}</p>
              </div>
            </div>

            {/* Showtimes */}
            <div className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">Showtimes Today</h2>
              <div className="space-y-4">
                {mockShowtimes.map((showtime) => (
                  <Card key={showtime.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{showtime.cinema}</p>
                          <p className="text-sm text-muted-foreground">{showtime.format}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{showtime.time}</p>
                          <p className="text-sm text-muted-foreground">€{showtime.price}</p>
                        </div>
                        <Button onClick={() => navigate(`/booking/${showtime.id}`)}>
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default Movie;
