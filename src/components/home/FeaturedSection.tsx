import { Star, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFeaturedVenues } from "@/hooks/useVenues";

const FeaturedSection = () => {
  const { data: venues = [], isLoading } = useFeaturedVenues(8);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {venues.map((venue, index) => (
              <Link
                key={venue.id}
                to={`/venue/${venue.slug}`}
                className="group glass-card overflow-hidden hover-glow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={venue.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                    {venue.cuisine || venue.type}
                  </div>

                  {venue.average_rating && Number(venue.average_rating) > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium">{Number(venue.average_rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {venue.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{venue.type}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {venue.city}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;
