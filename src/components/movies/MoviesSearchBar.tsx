import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MoviesSearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
}

const MoviesSearchBar = ({ query, setQuery, onSearch }: MoviesSearchBarProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Search movies, cinemas, location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="w-full"
      />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
};

export default MoviesSearchBar;
