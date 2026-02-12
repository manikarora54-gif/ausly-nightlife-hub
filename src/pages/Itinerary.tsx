import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CreditCard, Calendar, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import type { Itinerary as ItineraryType } from "@/types/itinerary";

const Itinerary = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: itinerary, isLoading } = useQuery({
    queryKey: ["itinerary", id],
    queryFn: async (): Promise<ItineraryType | null> => {
      const { data, error } = await (supabase as any)
        .from("itineraries")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-8 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Itinerary not found</h1>
          <Link to="/profile"><Button className="rounded-xl">Back to Profile</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const stops = (itinerary.stops as any[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Profile", href: "/profile" },
          { label: itinerary.title },
        ]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">{itinerary.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{itinerary.city}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(itinerary.created_at).toLocaleDateString()}</span>
                {itinerary.estimated_cost && (
                  <span className="flex items-center gap-1 text-primary"><CreditCard className="w-3.5 h-3.5" />~€{itinerary.estimated_cost}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Stops */}
        {stops.length > 0 && (
          <div className="relative space-y-0 mb-8">
            <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-primary via-secondary to-primary/20" />
            {stops.map((stop: any, i: number) => (
              <div key={i} className="relative flex gap-4 pb-6">
                <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <Card className="flex-1 glass-card hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-heading font-semibold">{stop.name}</h3>
                        {stop.type && <Badge variant="secondary" className="text-xs mt-1 capitalize">{stop.type}</Badge>}
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />{stop.time}
                      </Badge>
                    </div>
                    {stop.description && <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>}
                    <div className="flex items-center gap-3 flex-wrap">
                      {stop.cost && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />~€{stop.cost}
                        </span>
                      )}
                      {stop.address && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{stop.address}
                        </span>
                      )}
                      {stop.venue_id && (
                        <Link to={`/venue/${stop.venue_id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1">
                            <ExternalLink className="w-3 h-3" />View Venue
                          </Button>
                        </Link>
                      )}
                      {stop.venue_id && (
                        <Link to={`/booking?type=venue&venueId=${stop.venue_id}&venueName=${encodeURIComponent(stop.name)}&date=${new Date().toISOString().split("T")[0]}&time=${stop.time || "19:00"}&price=20`}>
                          <Button size="sm" className="h-7 text-xs rounded-lg gap-1">
                            <Calendar className="w-3 h-3" />Book Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Full itinerary markdown content */}
        {itinerary.content && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">
                <ReactMarkdown>{itinerary.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Itinerary;
