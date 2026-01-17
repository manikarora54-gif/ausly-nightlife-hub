import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticketCount, setTicketCount] = useState(1);

  const showtime = mockShowtimeDetails[showtimeId || "st1"] || mockShowtimeDetails.st1;
  const totalPrice = showtime.price * ticketCount;
  const serviceFee = 1.5 * ticketCount;
  const grandTotal = totalPrice + serviceFee;

  const handleBooking = () => {
    toast({
      title: "Booking Confirmed!",
      description: `${ticketCount} ticket(s) for ${showtime.movieTitle} at ${showtime.time}`,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-8 max-w-2xl">
        <Breadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Movies", href: "/movies" },
            { label: showtime.movieTitle, href: "/movie/1" },
            { label: "Booking" },
          ]}
        />

        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="space-y-6">
          {/* Showtime Details */}
          <Card>
            <CardHeader>
              <CardTitle>Showtime Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Ticket Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Standard Ticket</p>
                  <p className="text-sm text-muted-foreground">€{showtime.price} per ticket</p>
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

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tickets ({ticketCount}x €{showtime.price})</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>€{serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>€{grandTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full h-12 text-lg" onClick={handleBooking}>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay €{grandTotal.toFixed(2)}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
