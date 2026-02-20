import { Calendar, MapPin, Clock, ArrowRight, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { format } from "date-fns";

const EventsSection = () => {
  const { data: events = [], isLoading } = useUpcomingEvents(5);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Upcoming <span className="gradient-text">Events</span>
            </h2>
            <p className="text-muted-foreground">
              Don't miss out on the hottest happenings this week
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/discover?type=events">
              All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No upcoming events right now — check back soon!</p>
        ) : (
          <div className="space-y-4">
            {events.map((event: any, index: number) => (
              <Link
                key={event.id}
                to={`/event/${event.slug}`}
                className="group glass-card p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center hover-glow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-full md:w-32 h-24 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={event.images?.[0] || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop"}
                    alt={event.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {event.event_type}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors truncate">
                    {event.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.venues?.name || "Various venues"} • {event.venues?.city || "Germany"}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.start_date), "MMM d")}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(new Date(event.start_date), "HH:mm")}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="font-heading font-bold text-lg text-primary">
                    {event.ticket_price ? `€${event.ticket_price}` : "Free"}
                  </span>
                  <Button variant="neon" size="sm" className="ml-auto md:ml-0">
                    <Ticket className="w-4 h-4 mr-1" />
                    Get Tickets
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
