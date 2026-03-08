import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useVenue } from "@/hooks/useVenues";
import { useVenueReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ReviewForm from "@/components/venue/ReviewForm";
import {
  Star, MapPin, Clock, Phone, Globe, Heart, Share2, Calendar, Users,
  DollarSign, Loader2, Utensils, Wine, Music, ArrowRight,
} from "lucide-react";

const priceLabel = (range: number | null) => {
  if (!range) return "€";
  return "€".repeat(range);
};

const venueTypeConfig: Record<string, { icon: typeof Utensils; bookingType: string; cta: string; emoji: string }> = {
  restaurant: { icon: Utensils, bookingType: "reservation", cta: "Reserve a Table", emoji: "🍽️" },
  bar: { icon: Wine, bookingType: "bar", cta: "Reserve a Spot", emoji: "🍸" },
  club: { icon: Music, bookingType: "club", cta: "Get on the List", emoji: "🎶" },
  lounge: { icon: Wine, bookingType: "bar", cta: "Reserve Now", emoji: "🛋️" },
};
const defaultVenueConfig = { icon: Utensils, bookingType: "reservation", cta: "Reserve Now", emoji: "📍" };

const popularTimes: Record<string, string[]> = {
  restaurant: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"],
  bar: ["19:00", "20:00", "21:00", "22:00", "23:00"],
  club: ["22:00", "23:00", "00:00", "01:00"],
};

const Venue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: venue, isLoading, error } = useVenue(id || "");
  const { data: reviews } = useVenueReviews(venue?.id || "");
  const { user } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);

  const config = venue ? (venueTypeConfig[venue.type?.toLowerCase()] || defaultVenueConfig) : defaultVenueConfig;
  const timeSlotsForType = popularTimes[venue?.type?.toLowerCase() || "restaurant"] || popularTimes.restaurant;

  const handleReserve = () => {
    if (!venue) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to make a reservation.", variant: "destructive" });
      navigate("/sign-in", { state: { from: window.location.pathname } });
      return;
    }
    const params = new URLSearchParams({
      type: config.bookingType,
      venueId: venue.id,
      venueName: venue.name,
      venueSlug: venue.slug,
      date,
      time,
      guests: String(guests),
      price: String(venue.price_range ? venue.price_range * 15 : 0),
    });
    navigate(`/booking?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 space-y-6">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-heading font-bold mb-4">Venue not found</h1>
          <p className="text-muted-foreground mb-6">The venue you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/discover")}>Browse Venues</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = venue.images?.length
    ? venue.images
    : [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
      ];

  const openingHours = venue.opening_hours as Record<string, string> | null;
  const IconComp = config.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Discover", href: "/discover" },
              { label: venue.name },
            ]}
          />
        </div>

        {/* Hero Images */}
        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
            <div className="md:col-span-2 rounded-2xl overflow-hidden">
              <img src={images[0]} alt={venue.name} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop"; }}
              />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4">
              {images.slice(1, 3).map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <img src={img} alt={venue.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">{venue.type}</span>
                  {venue.cuisine && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">{venue.cuisine}</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{venue.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{venue.average_rating ?? "–"}</span>
                    <span className="text-muted-foreground">({venue.review_count ?? 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" />{venue.city}</div>
                  <div className="flex items-center gap-1 text-muted-foreground"><DollarSign className="w-4 h-4" />{priceLabel(venue.price_range)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-6">
                <h2 className="font-heading font-semibold text-xl mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {venue.description || venue.short_description || "No description available."}
                </p>
              </div>

              {/* Features */}
              {venue.features && venue.features.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="font-heading font-semibold text-xl mb-4">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {venue.features.map((f) => (
                      <span key={f} className="px-4 py-2 rounded-full bg-muted text-sm font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="glass-card p-6">
                <h2 className="font-heading font-semibold text-xl mb-6">Reviews</h2>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">U</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} />
                            ))}
                          </div>
                        </div>
                        {r.content && <p className="text-muted-foreground text-sm">{r.content}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
                )}
                <div className="mt-6">
                  <ReviewForm venueId={venue.id} />
                </div>
              </div>
            </div>

            {/* Sidebar — Enhanced Reservation */}
            <div className="space-y-4">
              <div className="glass-card p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                    {config.emoji}
                  </div>
                  <h3 className="font-heading font-semibold text-xl">{config.cta}</h3>
                </div>

                <div className="space-y-4 mb-5">
                  {/* Date */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        type="date"
                        value={date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Time with popular slots */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
                    <div className="relative mb-2">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-10" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {timeSlotsForType.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            time === t
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      {venue.type?.toLowerCase() === "club" ? "Tickets" : "Guests"}
                    </label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0" onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>
                        <span className="text-lg">-</span>
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold">{guests}</span>
                        <span className="text-xs text-muted-foreground ml-1">{venue.type?.toLowerCase() === "club" ? "tickets" : "guests"}</span>
                      </div>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0" onClick={() => setGuests(Math.min(20, guests + 1))} disabled={guests >= 20}>
                        <span className="text-lg">+</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Price estimate */}
                {venue.price_range && venue.price_range > 0 && (
                  <div className="bg-muted/50 rounded-xl p-3 mb-4 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated per person</span>
                      <span className="font-medium text-foreground">
                        €{venue.price_range * 15}
                      </span>
                    </div>
                  </div>
                )}

                <Button variant="neon" className="w-full" size="lg" disabled>
                  Coming Soon
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  Reservations will be available soon
                </p>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    if (navigator.share) { navigator.share({ title: venue.name, url: window.location.href }); }
                    else { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied!" }); }
                  }}>
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="glass-card p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Contact & Location</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{venue.address}</span>
                  </div>
                  {openingHours && Object.keys(openingHours).length > 0 && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary mt-0.5" />
                      <div className="text-muted-foreground space-y-0.5">
                        {Object.entries(openingHours).map(([day, hrs]) => (
                          <p key={day} className="capitalize">{day}: {hrs}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {venue.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{venue.phone}</span>
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-primary" />
                      <a href={venue.website} target="_blank" rel="noopener" className="text-primary hover:underline">Visit Website</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Venue;
