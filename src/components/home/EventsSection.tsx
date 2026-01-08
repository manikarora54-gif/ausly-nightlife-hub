import { Calendar, MapPin, Clock, ArrowRight, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const upcomingEvents = [
  {
    id: 1,
    name: "Techno Paradise Festival",
    venue: "Berghain",
    location: "Berlin",
    date: "Jan 27",
    time: "23:00",
    price: "€35",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop",
    category: "Electronic",
  },
  {
    id: 2,
    name: "Jazz Night Live",
    venue: "Buck and Breck",
    location: "Berlin",
    date: "Jan 20",
    time: "20:00",
    price: "€25",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=400&fit=crop",
    category: "Jazz",
  },
  {
    id: 3,
    name: "Wine Tasting Evening",
    venue: "Nobelhart & Schmutzig",
    location: "Berlin",
    date: "Jan 25",
    time: "19:00",
    price: "€95",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    category: "Food & Wine",
  },
  {
    id: 4,
    name: "Berlin Jazz Festival",
    venue: "Multiple Venues",
    location: "Berlin",
    date: "Feb 10",
    time: "18:00",
    price: "€45",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=400&fit=crop",
    category: "Jazz",
  },
  {
    id: 5,
    name: "Valentine's Wine & Dine",
    venue: "Tantris",
    location: "Munich",
    date: "Feb 14",
    time: "19:00",
    price: "€150",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    category: "Food & Wine",
  },
];

const EventsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
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

        {/* Events List */}
        <div className="space-y-4">
          {upcomingEvents.map((event, index) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="group glass-card p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center hover-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="w-full md:w-32 h-24 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop";
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors truncate">
                  {event.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {event.venue} • {event.location}
                </p>
              </div>

              {/* Date & Time */}
              <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="font-heading font-bold text-lg text-primary">
                  {event.price}
                </span>
                <Link to={`/event/${event.id}`} className="ml-auto md:ml-0">
                  <Button variant="neon" size="sm">
                    <Ticket className="w-4 h-4 mr-1" />
                    Get Tickets
                  </Button>
                </Link>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
