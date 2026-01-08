import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const cities = [
  {
    name: "Berlin",
    venues: 1200,
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop",
    vibe: "Underground & Eclectic",
  },
  {
    name: "Munich",
    venues: 850,
    image: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=600&h=400&fit=crop",
    vibe: "Traditional & Upscale",
  },
  {
    name: "Hamburg",
    venues: 720,
    image: "https://images.unsplash.com/photo-1567344044310-2b2e4daa1e3e?w=600&h=400&fit=crop",
    vibe: "Maritime & Trendy",
  },
  {
    name: "Frankfurt",
    venues: 580,
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&h=400&fit=crop",
    vibe: "Modern & International",
  },
  {
    name: "Cologne",
    venues: 640,
    image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&h=400&fit=crop",
    vibe: "Festive & Friendly",
  },
  {
    name: "Düsseldorf",
    venues: 420,
    image: "https://images.unsplash.com/photo-1577281366033-0b1dc7d14c54?w=600&h=400&fit=crop",
    vibe: "Chic & Artsy",
  },
];

const CitiesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Explore <span className="gradient-text">Germany</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From Berlin's legendary nightclubs to Munich's beer gardens, 
            discover the unique nightlife culture of each city
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {cities.map((city, index) => (
            <Link
              key={city.name}
              to={`/discover?city=${city.name.toLowerCase()}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&h=400&fit=crop";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                <h3 className="font-heading font-bold text-xl md:text-2xl mb-1 group-hover:text-primary transition-colors">
                  {city.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2">
                  {city.vibe}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">
                    {city.venues}+ venues
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
