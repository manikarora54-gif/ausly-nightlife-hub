import { Heart, Sparkles, Star, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePersonalized, PersonalizedItem } from "@/hooks/usePersonalized";
import { useAuth } from "@/hooks/useAuth";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GlowOrb } from "@/components/decorative/FloatingShapes";

const fallbackImages: Record<string, string> = {
  restaurant: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=500&fit=crop",
  bar: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800&h=500&fit=crop",
  club: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=500&fit=crop",
  event: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop",
  default: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop",
};

interface ForYouSectionProps {
  selectedCity: string;
}

const ForYouSection = ({ selectedCity }: ForYouSectionProps) => {
  const { ref, isVisible } = useScrollReveal();
  const { user } = useAuth();
  const { data: items = [], isLoading } = usePersonalized(selectedCity, 8);

  const title = user ? "Picked for you" : "Trending now";
  const subtitle = user
    ? `Personalized recommendations based on your favorites & activity in ${selectedCity}`
    : `The most popular spots and upcoming events in ${selectedCity}`;

  const getLink = (item: PersonalizedItem) =>
    item.type === "venue" ? `/venue/${item.slug}` : `/event/${item.slug}`;

  const getImage = (item: PersonalizedItem) =>
    item.image || fallbackImages[item.category] || fallbackImages[item.type] || fallbackImages.default;

  if (!isLoading && items.length === 0) return null;

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <GlowOrb color="secondary" size={300} className="top-[5%] left-[5%]" />
      <GlowOrb color="primary" size={200} className="bottom-[10%] right-[10%]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`flex items-center justify-between mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
              {user ? <Heart className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {title}
            </span>
            <h2 className="text-2xl md:text-4xl font-heading font-bold mb-2">
              {user ? (
                <>Your <span className="gradient-text">personalized</span> picks</>
              ) : (
                <>What's <span className="gradient-text">hot</span> in {selectedCity}</>
              )}
            </h2>
            <p className="text-muted-foreground max-w-lg">{subtitle}</p>
          </div>
          <Link
            to={`/discover?city=${selectedCity.toLowerCase()}`}
            className="hidden md:flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <Link
                key={item.id}
                to={getLink(item)}
                className={`group glass-card rounded-2xl overflow-hidden hover-glow transition-all duration-500 hover:-translate-y-1 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = fallbackImages.default;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                  {/* Rating badge */}
                  {item.rating && item.rating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-semibold">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      {Number(item.rating).toFixed(1)}
                    </div>
                  )}

                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-medium capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {item.city}
                  </p>

                  {/* Personalization reason */}
                  <div className="flex items-center gap-1.5 text-xs text-primary/80">
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{item.reason}</span>
                  </div>

                  {item.price && (
                    <div className="mt-2 font-bold text-sm text-primary">{item.price}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="md:hidden text-center mt-8">
          <Button variant="outline" asChild>
            <Link to={`/discover?city=${selectedCity.toLowerCase()}`}>
              See all recommendations <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForYouSection;
