import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/ausly-logo-neon.png";

const cities = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt", 
  "Stuttgart", "Düsseldorf", "Leipzig", "Dresden", "Hannover"
];

const HeroSection = () => {
  const [selectedCity, setSelectedCity] = useState("Berlin");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate(`/discover?city=${selectedCity.toLowerCase()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
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
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-full blur-xl opacity-60" />
              <img 
                src={logo} 
                alt="Ausly" 
                className="relative w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Main Headline - German */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Deine Stadt.{" "}
            <span className="gradient-text">Deine Nacht.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Entdecke Clubs, Partys und Events heute Nacht — deutschlandweit.
          </p>

          {/* City Selector */}
          <div 
            className="relative max-w-md mx-auto mb-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative">
              <button
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-2xl glass-card border border-primary/30 hover:border-primary/50 transition-all group"
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
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              onClick={handleExplore}
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl px-10 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Heute in {selectedCity}
            </Button>
          </div>

          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {["Berlin", "Hamburg", "München", "Köln", "Frankfurt"].map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  navigate(`/discover?city=${city.toLowerCase()}`);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-foreground/80 hover:text-foreground border border-white/10 hover:border-white/20 transition-all"
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
