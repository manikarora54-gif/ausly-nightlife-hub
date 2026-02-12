import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Calendar, MapPin, Clock, CreditCard, Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBookings } from "@/hooks/useBookings";
import { useItineraries } from "@/hooks/useItineraries";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: itineraries, isLoading: itinerariesLoading } = useItineraries();
  const { toast } = useToast();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "bookings";
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || profile?.display_name,
          phone: phone || profile?.phone,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-brand-cyan to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading">{profile?.display_name || "User"}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">Member since {new Date(profile?.created_at || "").toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="bookings" className="rounded-lg gap-2">
              <Calendar className="w-4 h-4" /> Bookings
            </TabsTrigger>
            <TabsTrigger value="itineraries" className="rounded-lg gap-2">
              <Sparkles className="w-4 h-4" /> Itineraries
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg gap-2">
              <User className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold">Your Bookings</h2>
              <Badge variant="outline">{bookings?.length || 0} total</Badge>
            </div>
            {bookingsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !bookings?.length ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-heading font-semibold mb-2">No bookings yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start exploring venues and events to make your first booking!</p>
                  <Link to="/discover">
                    <Button className="rounded-xl">Explore Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="glass-card hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={`${statusColor(booking.status)} border text-xs`}>
                              {booking.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">{booking.booking_type}</Badge>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.booking_date).toLocaleDateString()}
                            </div>
                            {booking.booking_time && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                {booking.booking_time}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-3.5 h-3.5" />
                              {booking.party_size} guests
                            </div>
                            <div className="flex items-center gap-2 font-medium text-primary">
                              <CreditCard className="w-3.5 h-3.5" />
                              €{booking.total_amount?.toFixed(2)}
                            </div>
                          </div>
                          {booking.confirmation_code && (
                            <p className="text-xs text-muted-foreground mt-2">Ref: {booking.confirmation_code}</p>
                          )}
                        </div>
                        {booking.venue_id && (
                          <Link to={`/venue/${booking.venue_id}`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Itineraries Tab */}
          <TabsContent value="itineraries" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold">Saved Itineraries</h2>
              <Badge variant="outline">{itineraries?.length || 0} saved</Badge>
            </div>
            {itinerariesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : !itineraries?.length ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-heading font-semibold mb-2">No itineraries yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Use the AI Planner to create personalized itineraries!</p>
                  <Button className="rounded-xl" onClick={() => navigate("/")}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Open AI Planner
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {itineraries.map((itinerary) => (
                  <Link key={itinerary.id} to={`/itinerary/${itinerary.id}`}>
                    <Card className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-heading font-semibold mb-1">{itinerary.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {itinerary.city}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(itinerary.created_at).toLocaleDateString()}
                              </span>
                              {itinerary.estimated_cost && (
                                <span className="flex items-center gap-1.5 text-primary">
                                  <CreditCard className="w-3.5 h-3.5" />
                                  ~€{itinerary.estimated_cost}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-heading font-semibold">Profile Settings</h2>
            <Card className="glass-card">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" /> Display Name
                  </label>
                  <Input
                    placeholder={profile?.display_name || "Your name"}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" /> Email
                  </label>
                  <Input value={user?.email || ""} disabled className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" /> Phone
                  </label>
                  <Input
                    placeholder={profile?.phone || "Your phone number"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleUpdateProfile} disabled={saving} className="rounded-xl">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Changes
                  </Button>
                  <Button variant="outline" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
