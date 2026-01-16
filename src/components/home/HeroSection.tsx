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

          {/* Modern Search Container */}
          <div 
            className="relative max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Glow effect behind search */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-2xl blur-xl opacity-40" />
            
            {/* Search Card */}
            <div className="relative backdrop-blur-xl bg-card/40 border border-white/10 rounded-2xl p-2 shadow-2xl">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                {/* Main Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="What are you looking for tonight?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 pl-12 pr-4 py-4 text-base md:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  />
                </div>
                
                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-border/50" />
                
                {/* City Selector */}
                <button
                  type="button"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Berlin</span>
                </button>
                
                {/* Search Button */}
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 h-auto font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02]">
                  <Search className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Search</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { label: "Restaurants", icon: "🍽️", path: "/discover?type=restaurants" },
              { label: "Bars & Clubs", icon: "🍸", path: "/discover?type=bars" },
              { label: "Live Events", icon: "🎵", path: "/discover?type=events" },
              { label: "Movies", icon: "🎬", path: "/movies" },
              { label: "Plan My Night", icon: "✨", path: "/plan", highlight: true },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  item.highlight
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105"
                    : "bg-white/5 hover:bg-white/10 text-foreground/80 hover:text-foreground border border-white/10 hover:border-white/20"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
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
