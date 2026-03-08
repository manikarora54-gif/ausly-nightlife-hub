import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CreditCard, Calendar, ExternalLink, Loader2, Sparkles, Share2, Trash2, RotateCcw, Utensils, Wine, Music, Navigation } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import type { Itinerary as ItineraryType } from "@/types/itinerary";

const stopTypeIcons: Record<string, typeof Utensils> = {
  dining: Utensils,
  drinks: Wine,
  nightlife: Music,
  activity: Navigation,
};

const Itinerary = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("itineraries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast({ title: "Itinerary deleted", description: "It's been removed from your profile." });
      navigate("/profile?tab=itineraries");
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete itinerary.", variant: "destructive" });
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: itinerary?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Share it with your friends." });
    }
  };

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
          <div className="max-w-md mx-auto">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-heading font-bold mb-2">Itinerary not found</h1>
            <p className="text-muted-foreground mb-6">This itinerary may have been deleted or you need to sign in.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/profile?tab=itineraries"><Button variant="outline" className="rounded-xl">My Itineraries</Button></Link>
              <Link to="/plan"><Button className="rounded-xl"><Sparkles className="w-4 h-4 mr-2" />Create New</Button></Link>
            </div>
          </div>
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
          { label: "Itineraries", href: "/profile?tab=itineraries" },
          { label: itinerary.title },
        ]} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold">{itinerary.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{itinerary.city}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(itinerary.created_at).toLocaleDateString()}</span>
                  {itinerary.estimated_cost && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <CreditCard className="w-3 h-3" /> ~€{itinerary.estimated_cost}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
            <Link to="/plan">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Plan Another
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Timeline Stops */}
        {stops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Timeline
            </h2>
            <div className="relative space-y-0">
              <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-primary via-secondary to-primary/20" />
              {stops.map((stop: any, i: number) => {
                const IconComp = stopTypeIcons[stop.type] || Navigation;
                return (
                  <div key={i} className="relative flex gap-4 pb-6">
                    <div className="relative z-10 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <IconComp className="w-4 h-4 text-primary" />
                    </div>
                    <Card className="flex-1 glass-card hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-heading font-semibold">{stop.name}</h3>
                            {stop.type && <Badge variant="secondary" className="text-xs mt-1 capitalize">{stop.type}</Badge>}
                          </div>
                          {stop.time && (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs shrink-0">
                              <Clock className="w-3 h-3" />{stop.time}
                            </Badge>
                          )}
                        </div>
                        {stop.description && <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>}
                        <div className="flex items-center gap-3 flex-wrap">
                          {stop.cost && (
                            <span className="text-xs text-primary flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />{stop.cost}
                            </span>
                          )}
                          {stop.address && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{stop.address}
                            </span>
                          )}
                          {stop.venue_slug && (
                            <Link to={`/venue/${stop.venue_slug}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1">
                                <ExternalLink className="w-3 h-3" />View Venue
                              </Button>
                            </Link>
                          )}
                          {stop.venue_id && (
                            <Link to={`/venue/${stop.venue_id}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1">
                                <ExternalLink className="w-3 h-3" />View Venue
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full itinerary markdown content */}
        {itinerary.content && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Full Plan
              </h2>
              <div className="prose prose-sm prose-invert max-w-none [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_p]:mb-3">
                <ReactMarkdown>{itinerary.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <Link to="/plan">
            <Button variant="neon" size="lg" className="rounded-xl gap-2">
              <Sparkles className="w-5 h-5" /> Plan Another Night
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Itinerary;
