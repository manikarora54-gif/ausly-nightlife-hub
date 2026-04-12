import { MapPin, Sparkles } from "lucide-react";
import SearchWithSuggestions from "@/components/search/SearchWithSuggestions";
import { useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden pt-24 pb-16">
      {/* Background video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&h=1080&fit=crop"
        >
          <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/80" />
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        {/* Animated color orbs on top */}
        <div className="absolute top-[15%] left-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[160px] animate-float" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-secondary/6 blur-[180px] animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content */}
        <div className="relative z-30 text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 text-primary text-sm font-medium mb-10 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--secondary) / 0.05))" }}
          >
            <Sparkles className="w-4 h-4" />
            Built for newcomers. Made for everyone.
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-heading font-extrabold mb-8 leading-[1.05] tracking-tight transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <span className="text-foreground">Make </span>
            <span className="gradient-text relative">
              {selectedCity}
              <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-60" />
            </span>
            <br />
            <span className="text-foreground">feel like yours</span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Restaurants, events, nightlife & hidden gems — curated for expats and newcomers exploring Germany
          </p>

          {/* Search Bar */}
          <div
            className={`max-w-2xl mx-auto mb-16 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 blur-lg opacity-60" />
              <div className="relative">
                <SearchWithSuggestions defaultCity={selectedCity} />
              </div>
            </div>
          </div>
        </div>

        {/* City Selector */}
        <div
          className={`relative z-10 max-w-5xl mx-auto transition-all duration-700 delay-[400ms] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Where are you?</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {cities.map((city) => (
              <button
                key={city.name}
                onClick={() => onCityChange(city.name)}
                className={`group relative overflow-hidden rounded-2xl aspect-[4/3] transition-all duration-500 ${
                  selectedCity === city.name
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.03] shadow-lg shadow-primary/20"
                    : "opacity-70 hover:opacity-100 hover:scale-[1.03]"
                }`}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <h3 className="font-heading font-bold text-foreground text-sm md:text-base tracking-wide">{city.name}</h3>
                </div>
                {selectedCity === city.name && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                      <MapPin className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`flex justify-center mt-16 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/30 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
