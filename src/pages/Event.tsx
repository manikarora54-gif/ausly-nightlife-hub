import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { useEvent } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Users,
  Ticket,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id || "");

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

  const images = event.images?.length
    ? event.images
    : ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop"];

  const spotsLeft = event.max_capacity ? event.max_capacity - (event.tickets_sold || 0) : null;

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
          <div className="rounded-2xl overflow-hidden h-[400px]">
            <img
              src={images[0]}
              alt={event.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=500&fit=crop";
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    {event.event_type}
                  </span>
                  {event.is_featured && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">
                      Featured
                    </span>
                  )}
                </div>
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

              {/* Venue info if available */}
              {event.venue_id && (
                <div className="glass-card p-6">
                  <h2 className="font-heading font-semibold text-xl mb-4">Venue</h2>
                  <p className="text-muted-foreground mb-3">This event takes place at a registered venue.</p>
                  <Link to={`/venue/${event.venue_id}`}>
                    <Button variant="outline" size="sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Venue Details
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="glass-card p-6 sticky top-24">
                <h3 className="font-heading font-semibold text-xl mb-4">Get Tickets</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-heading font-bold text-2xl text-primary">
                      {event.ticket_price ? `€${event.ticket_price}` : "Free"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{format(new Date(event.start_date), "MMM d, yyyy")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{format(new Date(event.start_date), "HH:mm")}</span>
                  </div>

                  {spotsLeft !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Spots left</span>
                      <span className={`font-medium ${spotsLeft < 10 ? "text-destructive" : ""}`}>
                        {spotsLeft > 0 ? spotsLeft : "Sold out"}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="default"
                  className="w-full"
                  size="lg"
                  disabled={spotsLeft !== null && spotsLeft <= 0}
                  onClick={() => {
                    const params = new URLSearchParams({
                      type: "event",
                      eventId: event.id,
                      eventName: event.name,
                      date: event.start_date,
                      price: String(event.ticket_price || 0),
                    });
                    navigate(`/booking?${params.toString()}`);
                  }}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  {spotsLeft !== null && spotsLeft <= 0 ? "Sold Out" : "Book Now"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: event.name, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
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
