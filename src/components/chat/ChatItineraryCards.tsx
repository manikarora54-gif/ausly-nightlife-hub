import { Link } from "react-router-dom";
import { MapPin, Clock, CreditCard, Star, Utensils, Wine, Music, Navigation, Ticket, Lightbulb } from "lucide-react";

export interface ItineraryStop {
  time: string;
  name: string;
  slug: string;
  type: "dining" | "drinks" | "nightlife" | "activity" | "event";
  description: string;
  cost_estimate: string;
  image?: string;
  tip?: string;
}

export interface ItineraryOption {
  title: string;
  emoji: string;
  vibe: string;
  estimated_total: number;
  stops: ItineraryStop[];
}

export interface ItineraryData {
  city: string;
  itineraries: ItineraryOption[];
}

const stopIcons: Record<string, typeof Utensils> = {
  dining: Utensils,
  drinks: Wine,
  nightlife: Music,
  activity: Navigation,
  event: Ticket,
};

const vibeColors: Record<string, string> = {
  chill: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  party: "from-pink-500/20 to-purple-500/20 border-pink-500/30",
  romantic: "from-rose-500/20 to-red-500/20 border-rose-500/30",
  foodie: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  cultural: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
  adventurous: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
};

function StopCard({ stop, index }: { stop: ItineraryStop; index: number }) {
  const Icon = stopIcons[stop.type] || Navigation;

  return (
    <Link
      to={stop.type === "event" ? `/event/${stop.slug}` : `/venue/${stop.slug}`}
      className="flex gap-2.5 group"
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        {index < 4 && <div className="w-px flex-1 bg-border/50 my-1" />}
      </div>

      {/* Card */}
      <div className="flex-1 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono text-muted-foreground">{stop.time}</span>
          <span className="text-[10px] text-muted-foreground">•</span>
          <span className="text-[10px] text-primary capitalize">{stop.type}</span>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/30 group-hover:border-primary/30 transition-colors">
          {stop.image && (
            <div className="h-20 overflow-hidden">
              <img
                src={stop.image}
                alt={stop.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
          <div className="p-2.5">
            <h4 className="font-semibold text-xs group-hover:text-primary transition-colors">{stop.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{stop.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-medium text-primary">{stop.cost_estimate}</span>
            </div>
            {stop.tip && (
              <div className="flex items-start gap-1 mt-1.5 bg-primary/5 rounded-md p-1.5">
                <Lightbulb className="w-2.5 h-2.5 text-primary shrink-0 mt-0.5" />
                <span className="text-[9px] text-muted-foreground">{stop.tip}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface Props {
  data: ItineraryData;
  onSelect?: (itinerary: ItineraryOption) => void;
}

export default function ChatItineraryCards({ data, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-medium">{data.city}</span>
        <span className="text-[10px] text-muted-foreground">• {data.itineraries.length} options</span>
      </div>

      {/* Horizontal scroll of itinerary options */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {data.itineraries.map((itinerary, i) => {
          const colorClass = vibeColors[itinerary.vibe] || vibeColors.chill;
          return (
            <div
              key={i}
              className={`min-w-[260px] max-w-[280px] snap-start rounded-xl border bg-gradient-to-br ${colorClass} p-3 shrink-0`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{itinerary.emoji}</span>
                    <h3 className="font-heading font-semibold text-sm leading-tight">{itinerary.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background/50 capitalize">{itinerary.vibe}</span>
                    <span className="text-[10px] flex items-center gap-0.5 text-primary font-medium">
                      <CreditCard className="w-2.5 h-2.5" />~€{itinerary.estimated_total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stops */}
              <div className="space-y-0">
                {itinerary.stops.map((stop, j) => (
                  <StopCard key={j} stop={stop} index={j} />
                ))}
              </div>

              {/* Select button */}
              {onSelect && (
                <button
                  onClick={() => onSelect(itinerary)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
                >
                  Choose this plan ✨
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
