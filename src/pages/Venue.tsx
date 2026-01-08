import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Heart, 
  Share2, 
  ChevronLeft,
  Calendar,
  Users,
  DollarSign
} from "lucide-react";

// Mock venue data
const venueData = {
  1: {
    id: 1,
    name: "Nobelhart & Schmutzig",
    type: "Restaurant",
    cuisine: "Modern German",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    address: "Friedrichstraße 218, 10969 Berlin",
    rating: 4.9,
    reviewCount: 342,
    price: "€€€€",
    hours: "Tue-Sat: 19:00 - 00:00",
    phone: "+49 30 259 40 610",
    website: "https://nobelhartundschmutzig.com",
    description: "A Michelin-starred restaurant focusing exclusively on regional, seasonal ingredients. Chef Micha Schäfer creates a unique 'Brutally Local' dining experience that celebrates Berlin's culinary heritage with a modern twist.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
    ],
    features: ["Michelin Star", "Vegetarian Options", "Wine Pairing", "Private Dining"],
    reviews: [
      { user: "Anna M.", rating: 5, text: "An unforgettable culinary journey. Every dish tells a story of Berlin.", date: "2 weeks ago" },
      { user: "Thomas K.", rating: 5, text: "The wine pairing was exceptional. Truly world-class dining.", date: "1 month ago" },
    ],
  },
};

const Venue = () => {
  const { id } = useParams();
  const venue = venueData[Number(id) as keyof typeof venueData] || venueData[1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link to="/discover" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Discover
          </Link>
        </div>

        {/* Hero Images */}
        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
            <div className="md:col-span-2 rounded-2xl overflow-hidden">
              <img 
                src={venue.images[0]} 
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4">
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={venue.images[1]} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={venue.images[2]} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                    {venue.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">
                    {venue.cuisine}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
                  {venue.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{venue.rating}</span>
                    <span className="text-muted-foreground">({venue.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {venue.neighborhood}, {venue.location}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    {venue.price}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card p-6">
                <h2 className="font-heading font-semibold text-xl mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {venue.description}
                </p>
              </div>

              {/* Features */}
              <div className="glass-card p-6">
                <h2 className="font-heading font-semibold text-xl mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {venue.features.map((feature) => (
                    <span 
                      key={feature}
                      className="px-4 py-2 rounded-full bg-muted text-sm font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-semibold text-xl">Reviews</h2>
                  <Button variant="outline" size="sm">Write a Review</Button>
                </div>
                
                <div className="space-y-4">
                  {venue.reviews.map((review, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{review.user}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Booking Card */}
              <div className="glass-card p-6 sticky top-24">
                <h3 className="font-heading font-semibold text-xl mb-4">Make a Reservation</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">Select a date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">Select a time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="font-medium">2 people</p>
                    </div>
                  </div>
                </div>

                <Button variant="neon" className="w-full" size="lg">
                  Reserve Now
                </Button>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="glass-card p-6">
                <h3 className="font-heading font-semibold text-lg mb-4">Contact & Location</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{venue.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{venue.hours}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{venue.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary" />
                    <a href={venue.website} target="_blank" rel="noopener" className="text-primary hover:underline">
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Venue;
