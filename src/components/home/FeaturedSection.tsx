import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const featuredVenues = [
  {
    id: 2,
    name: "Berghain",
    type: "Club",
    location: "Berlin",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&h=400&fit=crop",
    tag: "Legendary",
    tagColor: "bg-secondary",
  },
  {
    id: 3,
    name: "Tantris",
    type: "Fine Dining",
    location: "Munich",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    tag: "2 Michelin Stars",
    tagColor: "bg-primary",
  },
  {
    id: 8,
    name: "Skyline Bar 20up",
    type: "Rooftop Bar",
    location: "Hamburg",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
    tag: "Best Views",
    tagColor: "bg-accent",
  },
  {
    id: 5,
    name: "Watergate",
    type: "Club",
    location: "Berlin",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=600&h=400&fit=crop",
    tag: "Riverside",
    tagColor: "bg-secondary",
  },
  {
    id: 1,
    name: "Nobelhart & Schmutzig",
    type: "Restaurant",
    location: "Berlin",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    tag: "Michelin Star",
    tagColor: "bg-primary",
  },
  {
    id: 11,
    name: "Tim Raue",
    type: "Restaurant",
    location: "Berlin",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
    tag: "2 Michelin Stars",
    tagColor: "bg-primary",
  },
];

const FeaturedSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Featured <span className="gradient-text">Hotspots</span>
            </h2>
            <p className="text-muted-foreground">
              Hand-picked venues that define Germany's nightlife scene
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/discover">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVenues.map((venue, index) => (
            <Link
              key={venue.id}
              to={`/venue/${venue.id}`}
              className="group glass-card overflow-hidden hover-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                
                {/* Tag */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${venue.tagColor} text-primary-foreground`}>
                  {venue.tag}
                </div>

                {/* Rating */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium">{venue.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {venue.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{venue.type}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {venue.location}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
