import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVenue } from "@/hooks/useVenues";
import { useVenueReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Heart,
  Share2,
  Calendar,
  Users,
  DollarSign,
  Loader2,
} from "lucide-react";

const priceLabel = (range: number | null) => {
  if (!range) return "€";
  return "€".repeat(range);
};

const Venue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: venue, isLoading, error } = useVenue(id || "");
  const { data: reviews } = useVenueReviews(venue?.id || "");

  // Reservation form state
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(2);

  const handleReserve = () => {
    if (!venue) return;
    const params = new URLSearchParams({
      type: "reservation",
      venueId: venue.id,
      venueName: venue.name,
      date,
      time,
      price: "0",
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
              <img
                src={images[0]}
                alt={venue.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop";
                }}
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
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    {venue.type}
                  </span>
                  {venue.cuisine && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">
                      {venue.cuisine}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{venue.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{venue.average_rating ?? "–"}</span>
                    <span className="text-muted-foreground">({venue.review_count ?? 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {venue.city}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    {priceLabel(venue.price_range)}
                  </div>
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
                      <span key={f} className="px-4 py-2 rounded-full bg-muted text-sm font-medium">
                        {f}
                      </span>
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
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                            U
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {r.content && <p className="text-muted-foreground text-sm">{r.content}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No reviews yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Reservation Card */}
              <div className="glass-card p-6 sticky top-24">
                <h3 className="font-heading font-semibold text-xl mb-4">Make a Reservation</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Date</label>
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

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button variant="default" className="w-full" size="lg" onClick={handleReserve}>
                  Reserve Now
                </Button>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: venue.name, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
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
                          <p key={day} className="capitalize">
                            {day}: {hrs}
                          </p>
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
                      <a href={venue.website} target="_blank" rel="noopener" className="text-primary hover:underline">
                        Visit Website
                      </a>
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
