import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, CreditCard, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const mockShowtimeDetails: Record<string, {
  id: string;
  movieTitle: string;
  cinema: string;
  date: string;
  time: string;
  format: string;
  price: number;
}> = {
  st1: { id: "st1", movieTitle: "Dune: Part Two", cinema: "CineStar IMAX", date: "Today", time: "14:00", format: "IMAX", price: 18 },
  st2: { id: "st2", movieTitle: "Dune: Part Two", cinema: "CineStar IMAX", date: "Today", time: "17:30", format: "IMAX", price: 18 },
  st3: { id: "st3", movieTitle: "Dune: Part Two", cinema: "Zoo Palast", date: "Today", time: "15:00", format: "2D", price: 12 },
  st4: { id: "st4", movieTitle: "Dune: Part Two", cinema: "Zoo Palast", date: "Today", time: "20:00", format: "2D", price: 14 },
  st5: { id: "st5", movieTitle: "Dune: Part Two", cinema: "Kino International", date: "Today", time: "19:00", format: "2D", price: 11 },
};

const Booking = () => {
  const { showtimeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [ticketCount, setTicketCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");

  // Get booking type from URL params
  const bookingType = searchParams.get("type") || "movie";
  const venueId = searchParams.get("venueId");
  const eventId = searchParams.get("eventId");
  const venueName = searchParams.get("venueName") || "Venue";
  const eventName = searchParams.get("eventName");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const time = searchParams.get("time") || "19:00";
  const priceParam = searchParams.get("price");
  const price = priceParam ? parseFloat(priceParam) : 20;

  const showtime = showtimeId ? mockShowtimeDetails[showtimeId] || mockShowtimeDetails.st1 : null;
  
  const ticketPrice = showtime ? showtime.price : price;
  const totalPrice = ticketPrice * ticketCount;
  const serviceFee = 1.5 * ticketCount;
  const grandTotal = totalPrice + serviceFee;

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to complete a booking.",
        variant: "destructive",
      });
      navigate("/signin", { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    setIsProcessing(true);

    try {
      // Create booking in database
      const bookingData = {
        user_id: user.id,
        venue_id: venueId || null,
        event_id: eventId || null,
        booking_date: date,
        booking_time: time,
        party_size: ticketCount,
        total_amount: grandTotal,
        special_requests: specialRequests || null,
        booking_type: bookingType,
        status: "confirmed",
        payment_status: "paid", // In real app, this would be after Stripe payment
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your booking has been confirmed. Confirmation code: ${data.confirmation_code}`,
      });

      navigate("/");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Build breadcrumbs based on booking type
  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (showtime) {
    breadcrumbItems.push(
      { label: "Movies", href: "/movies" },
      { label: showtime.movieTitle, href: "/movie/1" },
      { label: "Booking" }
    );
  } else if (eventName) {
    breadcrumbItems.push(
      { label: "Events", href: "/discover?type=events" },
      { label: eventName },
      { label: "Booking" }
    );
  } else {
    breadcrumbItems.push(
      { label: "Venues", href: "/discover" },
      { label: venueName },
      { label: "Booking" }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-8 max-w-2xl">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="space-y-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showtime ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Movie</span>
                    <span className="font-medium">{showtime.movieTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cinema</span>
                    <span className="font-medium">{showtime.cinema}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium">{showtime.date} at {showtime.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <Badge variant="secondary">{showtime.format}</Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {eventName ? "Event" : "Venue"}
                    </span>
                    <span className="font-medium">{eventName || venueName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </span>
                    <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </span>
                    <span className="font-medium">{time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="capitalize">{bookingType}</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ticket/Guest Selection */}
          <Card>
            <CardHeader>
              <CardTitle>
                {bookingType === "movie" ? "Select Tickets" : "Party Size"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {bookingType === "movie" ? "Standard Ticket" : "Guests"}
                  </p>
                  <p className="text-sm text-muted-foreground">€{ticketPrice.toFixed(2)} per {bookingType === "movie" ? "ticket" : "person"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    disabled={ticketCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold w-8 text-center">{ticketCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                    disabled={ticketCount >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Special Requests (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests or notes for your booking..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {bookingType === "movie" ? "Tickets" : "Guests"} ({ticketCount}x €{ticketPrice.toFixed(2)})
                </span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>€{serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">€{grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* User info reminder */}
          {user && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Booking as <span className="font-medium text-foreground">{user.email}</span>
                </p>
              </CardContent>
            </Card>
          )}

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleBooking}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay €{grandTotal.toFixed(2)}
              </>
            )}
          </Button>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              You'll be asked to sign in before completing your booking.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
