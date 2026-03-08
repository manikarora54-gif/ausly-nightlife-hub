import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Minus, Plus, CreditCard, Calendar, Clock, MapPin, Loader2, Check, Ticket,
  Utensils, Wine, Music, Film, Sparkles, Users, ArrowLeft, ArrowRight, Shield,
  PartyPopper, Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Category config for type-specific UX
const categoryConfig: Record<string, {
  icon: typeof Utensils;
  label: string;
  quantityLabel: string;
  quantityUnit: string;
  color: string;
  emoji: string;
}> = {
  reservation: { icon: Utensils, label: "Restaurant Reservation", quantityLabel: "Guests", quantityUnit: "guest", color: "text-orange-400", emoji: "🍽️" },
  bar: { icon: Wine, label: "Bar Reservation", quantityLabel: "Guests", quantityUnit: "guest", color: "text-purple-400", emoji: "🍸" },
  club: { icon: Music, label: "Club Entry", quantityLabel: "Tickets", quantityUnit: "ticket", color: "text-pink-400", emoji: "🎶" },
  event: { icon: Ticket, label: "Event Tickets", quantityLabel: "Tickets", quantityUnit: "ticket", color: "text-cyan-400", emoji: "🎫" },
  experience: { icon: Sparkles, label: "Experience Booking", quantityLabel: "Participants", quantityUnit: "person", color: "text-emerald-400", emoji: "✨" },
  movie: { icon: Film, label: "Movie Tickets", quantityLabel: "Tickets", quantityUnit: "ticket", color: "text-yellow-400", emoji: "🎬" },
};

const defaultConfig = categoryConfig.reservation;

const mockShowtimeDetails: Record<string, {
  id: string; movieTitle: string; cinema: string; date: string; time: string; format: string; price: number;
}> = {
  st1: { id: "st1", movieTitle: "Dune: Part Two", cinema: "CineStar IMAX", date: "Today", time: "14:00", format: "IMAX", price: 18 },
  st2: { id: "st2", movieTitle: "Dune: Part Two", cinema: "CineStar IMAX", date: "Today", time: "17:30", format: "IMAX", price: 18 },
  st3: { id: "st3", movieTitle: "Dune: Part Two", cinema: "Zoo Palast", date: "Today", time: "15:00", format: "2D", price: 12 },
  st4: { id: "st4", movieTitle: "Dune: Part Two", cinema: "Zoo Palast", date: "Today", time: "20:00", format: "2D", price: 14 },
  st5: { id: "st5", movieTitle: "Dune: Part Two", cinema: "Kino International", date: "Today", time: "19:00", format: "2D", price: 11 },
};

const timeSlots = [
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
];

const Booking = () => {
  const { showtimeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const bookingType = searchParams.get("type") || "movie";
  const venueId = searchParams.get("venueId");
  const eventId = searchParams.get("eventId");
  const venueName = searchParams.get("venueName") || "Venue";
  const eventName = searchParams.get("eventName");
  const venueSlug = searchParams.get("venueSlug");
  const paramDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const paramTime = searchParams.get("time") || "19:00";
  const priceParam = searchParams.get("price");
  const price = priceParam ? parseFloat(priceParam) : 0;

  const config = categoryConfig[bookingType] || defaultConfig;
  const showtime = showtimeId ? mockShowtimeDetails[showtimeId] || null : null;

  // Step management: 1=details, 2=review, 3=confirmed
  const [step, setStep] = useState(1);
  const [ticketCount, setTicketCount] = useState(showtime ? 1 : parseInt(searchParams.get("guests") || "2"));
  const [selectedDate, setSelectedDate] = useState(paramDate);
  const [selectedTime, setSelectedTime] = useState(paramTime);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const ticketPrice = showtime ? showtime.price : price;
  const hasCost = ticketPrice > 0;
  const totalPrice = ticketPrice * ticketCount;
  const serviceFee = hasCost ? Math.round(1.5 * ticketCount * 100) / 100 : 0;
  const grandTotal = totalPrice + serviceFee;

  const displayName = showtime ? showtime.movieTitle : eventName || venueName;
  const displaySubtitle = showtime ? showtime.cinema : bookingType === "event" ? "Event" : venueName;

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to complete a booking.", variant: "destructive" });
      navigate("/sign-in", { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    setIsProcessing(true);

    try {
      const bookingData = {
        user_id: user.id,
        venue_id: venueId || null,
        event_id: eventId || null,
        booking_date: selectedDate,
        booking_time: selectedTime,
        party_size: ticketCount,
        total_amount: grandTotal > 0 ? grandTotal : null,
        special_requests: specialRequests || null,
        booking_type: bookingType,
        status: "confirmed",
        payment_status: hasCost ? "paid" : "confirmed",
      };

      const { data, error } = await supabase.from("bookings").insert(bookingData).select().single();
      if (error) throw error;

      setConfirmationCode(data.confirmation_code || "AUS-XXXX");
      setStep(3);
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({ title: "Booking Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...(showtime
      ? [{ label: "Movies", href: "/movies" }, { label: showtime.movieTitle, href: `/movie/${showtimeId}` }]
      : eventName
        ? [{ label: "Events", href: "/discover?type=events" }, { label: eventName }]
        : [{ label: "Discover", href: "/discover" }, { label: venueName, href: venueSlug ? `/venue/${venueSlug}` : undefined }]
    ),
    { label: "Booking" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12 max-w-2xl">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Details</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>Review</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>Confirmed</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Header with category icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl`}>
            {config.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">{step === 3 ? "Booking Confirmed!" : displayName}</h1>
            <p className="text-sm text-muted-foreground">{config.label}</p>
          </div>
        </div>

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Date & Time */}
            {!showtime && (
              <Card className="glass-card">
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-heading font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> When?
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                      <Input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Quick time slots for restaurants/bars */}
                  {(bookingType === "reservation" || bookingType === "bar") && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Popular times</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTime(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedTime === t
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Showtime info for movies */}
            {showtime && (
              <Card className="glass-card">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-heading font-semibold flex items-center gap-2">
                    <Film className="w-4 h-4 text-primary" /> Showtime
                  </h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Cinema</span>
                    <span className="font-medium text-right">{showtime.cinema}</span>
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-right">{showtime.date}</span>
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-right">{showtime.time}</span>
                    <span className="text-muted-foreground">Format</span>
                    <Badge variant="secondary" className="w-fit ml-auto">{showtime.format}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity */}
            <Card className="glass-card">
              <CardContent className="p-5">
                <h3 className="font-heading font-semibold flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-primary" /> {config.quantityLabel}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{config.quantityLabel}</p>
                    {hasCost && (
                      <p className="text-sm text-muted-foreground">€{ticketPrice.toFixed(2)} per {config.quantityUnit}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} disabled={ticketCount <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-bold w-8 text-center">{ticketCount}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setTicketCount(Math.min(20, ticketCount + 1))} disabled={ticketCount >= 20}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card className="glass-card">
              <CardContent className="p-5">
                <h3 className="font-heading font-semibold mb-3">Special Requests</h3>
                <Textarea
                  placeholder={
                    bookingType === "reservation" ? "Dietary requirements, seating preference, celebration details..."
                    : bookingType === "event" ? "Accessibility needs, group arrangements..."
                    : bookingType === "movie" ? "Preferred seating area, accessibility needs..."
                    : "Any special requirements..."
                  }
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            <Button variant="neon" size="lg" className="w-full" onClick={() => setStep(2)}>
              Review Booking <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* STEP 2: Review */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <Card className="glass-card">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-heading font-semibold text-lg">Booking Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">{eventName ? "Event" : "Venue"}</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                  {showtime && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Cinema</span>
                      <span className="font-medium">{showtime.cinema}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                    <span className="font-medium">
                      {showtime ? showtime.date : format(new Date(selectedDate + "T00:00:00"), "EEE, MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                    <span className="font-medium">{showtime ? showtime.time : selectedTime}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {config.quantityLabel}</span>
                    <span className="font-medium">{ticketCount}</span>
                  </div>
                  {showtime && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Format</span>
                      <Badge variant="secondary">{showtime.format}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className="capitalize">{config.label}</Badge>
                  </div>
                  {specialRequests && (
                    <div className="py-2 border-b border-border">
                      <span className="text-muted-foreground block mb-1">Special Requests</span>
                      <p className="text-sm">{specialRequests}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price breakdown */}
            {hasCost ? (
              <Card className="glass-card border-primary/20">
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-heading font-semibold">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{ticketCount}× €{ticketPrice.toFixed(2)}</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>€{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">€{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">Free Reservation</p>
                    <p className="text-sm text-muted-foreground">No payment required — just show up!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure booking • Instant confirmation • Free cancellation</span>
            </div>

            {/* User info */}
            {user && (
              <p className="text-sm text-center text-muted-foreground">
                Booking as <span className="font-medium text-foreground">{user.email}</span>
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button variant="neon" className="flex-1 h-12" onClick={handleConfirmBooking} disabled={isProcessing}>
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : hasCost ? (
                  <><CreditCard className="h-4 w-4 mr-2" /> Pay €{grandTotal.toFixed(2)}</>
                ) : (
                  <><Check className="h-4 w-4 mr-2" /> Confirm Reservation</>
                )}
              </Button>
            </div>

            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                You'll be asked to sign in before completing your booking.
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-heading font-bold mb-2">You're all set! 🎉</h2>
              <p className="text-muted-foreground">Your booking has been confirmed</p>
            </div>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Confirmation Code</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-heading font-bold text-primary tracking-wider">{confirmationCode}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(confirmationCode);
                        toast({ title: "Copied!", description: "Confirmation code copied." });
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">What</span>
                    <span className="font-medium">{displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">When</span>
                    <span className="font-medium">
                      {showtime ? `${showtime.date} at ${showtime.time}` : `${format(new Date(selectedDate + "T00:00:00"), "MMM d")} at ${selectedTime}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{config.quantityLabel}</span>
                    <span className="font-medium">{ticketCount}</span>
                  </div>
                  {grandTotal > 0 && (
                    <div className="flex justify-between pt-2 border-t border-border font-bold">
                      <span>Total Paid</span>
                      <span className="text-primary">€{grandTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="neon" className="flex-1" onClick={() => navigate("/profile?tab=bookings")}>
                View My Bookings
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/discover")}>
                Discover More
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
