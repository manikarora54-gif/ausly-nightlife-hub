import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cities = [
  { name: "Berlin", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop" },
  { name: "Hamburg", image: "https://images.unsplash.com/photo-1562930622-0ce10b97bd73?w=400&h=300&fit=crop" },
  { name: "München", image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=400&h=300&fit=crop" },
  { name: "Köln", image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400&h=300&fit=crop" },
  { name: "Frankfurt", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop" },
  { name: "Düsseldorf", image: "https://images.unsplash.com/photo-1599138801168-b58f4c41e5eb?w=400&h=300&fit=crop" },
];

interface HeroSectionProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const HeroSection = ({ selectedCity, onCityChange }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/discover?search=${encodeURIComponent(searchQuery)}&city=${selectedCity.toLowerCase()}`);
    } else {
      navigate(`/discover?city=${selectedCity.toLowerCase()}`);
    }
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden pt-20 pb-10">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Deine Stadt. Dein Tag.
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-[1.1] animate-fade-in">
            Discover what's
            <br />
            happening in{" "}
            <span className="gradient-text">{selectedCity}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-10 animate-fade-in">
            Events, restaurants, nightlife & more — all in one place
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-14 animate-fade-in">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search restaurants, events, clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="rounded-xl px-6 py-3 h-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Explore
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* City Selector */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => onCityChange(city.name)}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] transition-all duration-300 hover:scale-105 ${
                  selectedCity === city.name
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5 text-center">
                  <h3 className="font-heading font-bold text-foreground text-sm md:text-base">{city.name}</h3>
                </div>
                {selectedCity === city.name && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <MapPin className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
