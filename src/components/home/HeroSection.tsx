import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, Search, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/ausly-logo.svg";

const cities = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt", 
  "Stuttgart", "Leipzig", "Düsseldorf", "Dresden", "Hannover"
];

const HeroSection = () => {
  const [selectedCity, setSelectedCity] = useState("Berlin");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate(`/discover?city=${selectedCity.toLowerCase()}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <img 
              src={logo} 
              alt="Ausly" 
              className="w-48 md:w-56 h-auto object-contain"
            />
          </div>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-primary font-semibold mb-4 animate-fade-in tracking-wide" style={{ animationDelay: "0.1s" }}>
            Deine Stadt. Dein Tag.
          </p>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 animate-fade-in leading-tight" style={{ animationDelay: "0.15s" }}>
            Discover and book what's happening in your city — <span className="gradient-text">anytime.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Events, movies, restaurants, culture, and nightlife — all in one place, across Germany.
          </p>

          {/* City Selector */}
          <div 
            className="relative max-w-sm mx-auto mb-8 animate-fade-in"
            style={{ animationDelay: "0.25s" }}
          >
            <button
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl glass-card border border-primary/30 hover:border-primary/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg font-medium text-foreground">{selectedCity}</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCityOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 glass-card border border-border/50 rounded-xl z-50 max-h-64 overflow-y-auto">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setIsCityOpen(false);
                    }}
                    className={`w-full text-left px-6 py-3 hover:bg-primary/10 transition-colors ${
                      selectedCity === city ? 'text-primary bg-primary/5' : 'text-foreground'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button 
              onClick={handleExplore}
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02] w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore my city
            </Button>
            
            <Button 
              onClick={() => navigate("/contact")}
              variant="outline"
              size="lg" 
              className="rounded-xl px-8 py-6 h-auto text-lg font-semibold border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 w-full sm:w-auto"
            >
              <Building2 className="w-5 h-5 mr-2" />
              List your place or event
            </Button>
          </div>

          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Leipzig", "Stuttgart"].map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  navigate(`/discover?city=${city.toLowerCase()}`);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30 transition-all"
              >
                {city}
              </button>
            ))}
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
