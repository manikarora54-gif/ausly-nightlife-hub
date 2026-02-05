import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, Sparkles, Calendar, Film, Utensils, Music, Compass } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const cities = [
  { name: "Berlin", image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=300&fit=crop", count: "2.4k+" },
  { name: "Hamburg", image: "https://images.unsplash.com/photo-1562930622-0ce10c97bd73?w=400&h=300&fit=crop", count: "1.8k+" },
  { name: "München", image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=400&h=300&fit=crop", count: "2.1k+" },
  { name: "Köln", image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=400&h=300&fit=crop", count: "1.2k+" },
  { name: "Frankfurt", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=300&fit=crop", count: "980+" },
  { name: "Leipzig", image: "https://images.unsplash.com/photo-1599138801168-b58f4c41e5eb?w=400&h=300&fit=crop", count: "750+" },
];

const quickActions = [
  { icon: Calendar, label: "Events", type: "events", color: "primary" },
  { icon: Film, label: "Movies", type: "movies", color: "secondary" },
  { icon: Utensils, label: "Dining", type: "restaurant", color: "accent" },
  { icon: Music, label: "Nightlife", type: "club", color: "primary" },
];

interface HeroSectionProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
}

const HeroSection = ({ selectedCity, onCityChange }: HeroSectionProps) => {
  const navigate = useNavigate();

  const handleCitySelect = (city: string) => {
    onCityChange(city);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-10">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Deine Stadt. Dein Tag.
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-4 leading-tight">
            What's happening in{" "}
            <span className="gradient-text">{selectedCity}</span>?
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Discover events, restaurants, movies & nightlife — all in one place
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {quickActions.map((action) => (
            <Link
              key={action.type}
              to={action.type === "movies" ? "/movies" : `/discover?type=${action.type}&city=${selectedCity.toLowerCase()}`}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl glass-card border border-border/50 hover:border-primary/50 transition-all hover:scale-105"
            >
              <div className={`w-10 h-10 rounded-xl bg-${action.color}/10 flex items-center justify-center`}>
                <action.icon className={`w-5 h-5 text-${action.color}`} />
              </div>
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* City Cards Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold">
              <Compass className="w-5 h-5 inline mr-2 text-primary" />
              Explore Cities
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/discover")}>
              View all →
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city.name)}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] transition-all hover:scale-105 ${
                  selectedCity === city.name ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-heading font-bold text-foreground text-lg">{city.name}</h3>
                  <p className="text-xs text-muted-foreground">{city.count} listings</p>
                </div>
                {selectedCity === city.name && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate(`/discover?city=${selectedCity.toLowerCase()}`)}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl px-10 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
          >
            Explore {selectedCity}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
