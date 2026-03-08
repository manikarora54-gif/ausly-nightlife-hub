import { Calendar, Clock, MapPin, Utensils, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useVenues } from "@/hooks/useVenues";
import { format } from "date-fns";
import berlinBg from "@/assets/berlin-nightlife-bg.jpg";

const getIcon = (type: string) => {
  switch (type) {
    case "restaurant":
    case "cafe":
      return Utensils;
    case "cinema":
      return Film;
    case "club":
    case "bar":
    case "live_music":
      return Music;
    default:
      return Calendar;
  }
};

const getCTAText = () => {
  return "View details";
};

const fallbackImagesByType: Record<string, string[]> = {
  event: [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
  ],
  restaurant: [
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800&h=500&fit=crop",
  ],
  bar: [
    "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop",
  ],
  club: [
    "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop",
  ],
  live_music: [
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop",
  ],
  cinema: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=500&fit=crop",
  ],
  cafe: [
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop",
  ],
};

const getFallbackImage = (type: string, seed = 0) => {
  const normalizedType = type?.toLowerCase() ?? "event";
  const pool = fallbackImagesByType[normalizedType] || fallbackImagesByType.event;
  return pool[seed % pool.length];
};

interface WhatsHappeningSectionProps {
  selectedCity: string;
}

const WhatsHappeningSection = ({ selectedCity }: WhatsHappeningSectionProps) => {
  const { data: events = [], isLoading: eventsLoading } = useEvents({ 
    upcoming: true, 
    limit: 4,
    city: selectedCity 
  });
  const { data: venues = [], isLoading: venuesLoading } = useVenues({ 
    limit: 4,
    city: selectedCity 
  });

  const isLoading = eventsLoading || venuesLoading;

  // Combine events and venues into one list
  const happeningNow = [
    ...events.map((event: any) => ({
      id: event.id,
      name: event.name,
      type: "event",
      category: event.event_type,
      time: event.start_date ? format(new Date(event.start_date), "HH:mm") : "Today",
      location: event.venues?.name || "Various locations",
      city: event.venues?.city || selectedCity,
      image: event.images?.[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
      price: event.ticket_price ? `€${event.ticket_price.toFixed(0)}` : null,
      link: `/event/${event.slug || event.id}`,
    })),
    ...venues.slice(0, 4).map((venue) => ({
      id: venue.id,
      name: venue.name,
      type: venue.type,
      category: venue.cuisine || venue.type,
      time: "Open now",
      location: venue.address,
      city: venue.city,
      image: venue.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      price: venue.price_range && venue.price_range > 0 ? "€".repeat(venue.price_range) : null,
      link: `/venue/${venue.slug || venue.id}`,
    })),
  ].slice(0, 8);

  const hasNoData = !isLoading && happeningNow.length === 0;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background image — lightly visible */}
      <div className="absolute inset-0 -top-20">
        <img
          src={berlinBg}
          alt=""
          className="w-full h-full object-cover opacity-[0.15]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
        <div className="absolute inset-0 bg-primary/[0.03]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            Live Now
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            What's happening in <span className="gradient-text">{selectedCity}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover events, restaurants, movies, and activities happening right now in {selectedCity}
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : hasNoData ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">No listings in {selectedCity} yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              We're expanding to new cities across Germany. Check back soon or explore other cities!
            </p>
            <Button variant="outline" asChild>
              <Link to="/discover">Explore all cities</Link>
            </Button>
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {happeningNow.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="group glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
                        <Icon className="w-3 h-3 text-primary" />
                        {item.category}
                      </span>
                    </div>

                    {/* Time Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />
                      {item.city}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {item.price && <span className="font-bold text-primary">{item.price}</span>}
                      {!item.price && <span />}
                      <Button size="sm" variant="neon" className="text-xs">
                        {getCTAText()}
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {!hasNoData && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to={`/discover?city=${selectedCity.toLowerCase()}`}>
                View all in {selectedCity}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhatsHappeningSection;
