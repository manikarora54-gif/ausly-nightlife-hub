import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Discover Germany's Best Nightlife
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Plan Your Perfect{" "}
            <span className="gradient-text">Night Out</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            From hidden bars to world-class restaurants, discover curated experiences
            and let AI plan your unforgettable evening in Germany.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search restaurants, bars, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base"
              />
            </div>
            <Button type="submit" variant="hero" size="xl">
              <Search className="w-5 h-5 mr-2" />
              Explore
            </Button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/discover?type=restaurants")}
              className="rounded-full"
            >
              🍽️ Restaurants
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/discover?type=bars")}
              className="rounded-full"
            >
              🍸 Bars & Clubs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/discover?type=events")}
              className="rounded-full"
            >
              🎵 Events
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/plan")}
              className="rounded-full"
            >
              ✨ Plan My Night
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">5K+</div>
              <div className="text-sm text-muted-foreground">Venues</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-accent mb-1">100K+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
