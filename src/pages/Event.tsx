import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEvent } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Clock, Calendar, Users, Ticket, Share2, ArrowRight, Minus, Plus, Shield,
} from "lucide-react";
import { format } from "date-fns";
import SEOHead from "@/components/seo/SEOHead";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id || "");
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticketCount, setTicketCount] = useState(1);

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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-heading font-bold mb-4">Event not found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has ended.</p>
          <Button onClick={() => navigate("/discover?type=events")}>Browse Events</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isMovie = event.event_type === "movie";
  const hasPrice = event.ticket_price != null && event.ticket_price > 0;
  const images = event.images?.length
    ? event.images
    : ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop"];

  const spotsLeft = event.max_capacity ? event.max_capacity - (event.tickets_sold || 0) : null;
  const spotsPercentage = event.max_capacity && spotsLeft !== null ? ((event.tickets_sold || 0) / event.max_capacity) * 100 : null;
  const totalPrice = event.ticket_price ? event.ticket_price * ticketCount : 0;

  const handleBook = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to book tickets.", variant: "destructive" });
      navigate("/signin", { state: { from: window.location.pathname } });
      return;
    }
    const params = new URLSearchParams({
      type: "event",
      eventId: event.id,
      eventName: event.name,
      date: event.start_date,
      time: format(new Date(event.start_date), "HH:mm"),
      price: String(event.ticket_price || 0),
      guests: String(ticketCount),
    });
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Events", href: "/discover?type=events" },
              { label: event.name },
            ]}
          />
        </div>

        {/* Hero Image */}
        <div className="container mx-auto px-4 mb-8">
          <div className="rounded-2xl overflow-hidden h-[400px] relative">
            <img
              src={images[0]}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/90 text-primary-foreground">{event.event_type}</Badge>
                {event.is_featured && <Badge className="bg-secondary/90 text-secondary-foreground">Featured</Badge>}
                {spotsLeft !== null && spotsLeft < 20 && spotsLeft > 0 && (
                  <Badge variant="destructive" className="animate-pulse">Only {spotsLeft} spots left!</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">{event.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.start_date), "EEEE, MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(event.start_date), "HH:mm")}
                    {event.end_date && ` – ${format(new Date(event.end_date), "HH:mm")}`}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-6">
                <h2 className="font-heading font-semibold text-xl mb-4">About this event</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description || event.short_description || "No description available."}
                </p>
              </div>

              {/* Venue info */}
              {event.venue_id && (
                <div className="glass-card p-6">
                  <h2 className="font-heading font-semibold text-xl mb-4">Venue</h2>
                  <p className="text-muted-foreground mb-3">This event takes place at a registered venue.</p>
                  <Link to={`/venue/${event.venue_id}`}>
                    <Button variant="outline" size="sm">
                      <MapPin className="w-4 h-4 mr-2" /> View Venue Details
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar — Enhanced Ticket Selector */}
            <div className="space-y-4">
              <div className="glass-card p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">
                    🎫
                  </div>
                  <h3 className="font-heading font-semibold text-xl">Get Tickets</h3>
                </div>

                <div className="space-y-4 mb-5">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price per ticket</span>
                    <span className="font-heading font-bold text-2xl text-primary">
                      {hasPrice ? `€${event.ticket_price}` : isMovie ? "Check cinema" : "Free"}
                    </span>
                  </div>

                  {/* Date & Time */}
                  <div className="bg-muted/50 rounded-xl p-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                      <span className="font-medium">{format(new Date(event.start_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                      <span className="font-medium">{format(new Date(event.start_date), "HH:mm")}</span>
                    </div>
                  </div>

                  {/* Capacity indicator */}
                  {spotsLeft !== null && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{event.tickets_sold || 0} sold</span>
                        <span className={`font-medium ${spotsLeft < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                          {spotsLeft > 0 ? `${spotsLeft} left` : "Sold out"}
                        </span>
                      </div>
                      <Progress value={spotsPercentage || 0} className="h-1.5" />
                    </div>
                  )}

                  {/* Ticket quantity */}
                  {(spotsLeft === null || spotsLeft > 0) && hasPrice && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Tickets</label>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0"
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} disabled={ticketCount <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold">{ticketCount}</span>
                          <span className="text-xs text-muted-foreground ml-1">tickets</span>
                        </div>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shrink-0"
                          onClick={() => setTicketCount(Math.min(spotsLeft ?? 10, ticketCount + 1))} disabled={ticketCount >= (spotsLeft ?? 10)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Price summary */}
                  {hasPrice && ticketCount > 0 && (
                    <div className="bg-muted/50 rounded-xl p-3 space-y-1.5 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{ticketCount}× €{event.ticket_price}</span>
                        <span>€{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Service fee</span>
                        <span>€{(1.5 * ticketCount).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">€{(totalPrice + 1.5 * ticketCount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Cinema pricing note */}
                  {isMovie && !hasPrice && (
                    <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-xl p-3">
                      Ticket prices vary by cinema and format. Check your local cinema for exact pricing.
                    </p>
                  )}
                </div>

                <Button
                  variant="neon"
                  className="w-full"
                  size="lg"
                  disabled
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center mt-3">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Booking will be available soon</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    if (navigator.share) { navigator.share({ title: event.name, url: window.location.href }); }
                    else { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied!" }); }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventPage;
