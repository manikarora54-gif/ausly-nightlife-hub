import { Link } from "react-router-dom";
import { Star } from "lucide-react";

const MovieCard = ({ movie }: { movie: any }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="group block rounded-xl shadow-lg bg-card p-4 relative h-full focus:ring-2 focus:ring-primary transition outline-none">
      <div className="flex gap-4 items-center">
        {/* Poster image: fallback if missing */}
        <div className="w-16 h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center ring-1 ring-border">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title} className="object-cover w-full h-full" />
          ) : (
            <span className="text-sm text-muted-foreground">No Image</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg mb-1">{movie.title}</div>
          <div className="text-xs text-muted-foreground mb-1">{movie.genres?.join(", ")}</div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4" />
            {movie.rating ?? "--"}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
