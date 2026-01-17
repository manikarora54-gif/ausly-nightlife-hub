import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Globe, 
  Heart, 
  Share2,
  Calendar,
  Users,
  DollarSign
} from "lucide-react";

// Mock venue data
const venueData: Record<number, any> = {
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
    description: "A Michelin-starred restaurant focusing exclusively on regional, seasonal ingredients. Chef Micha Schäfer creates a unique 'Brutally Local' dining experience that celebrates Berlin's culinary heritage with a modern twist. The restaurant's philosophy centers on using only ingredients from within a 200km radius of Berlin, creating an authentic taste of the region.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
    ],
    features: ["Michelin Star", "Vegetarian Options", "Wine Pairing", "Private Dining"],
    reviews: [
      { user: "Anna M.", rating: 5, text: "An unforgettable culinary journey. Every dish tells a story of Berlin. The service was impeccable and the wine selection outstanding.", date: "2 weeks ago" },
      { user: "Thomas K.", rating: 5, text: "The wine pairing was exceptional. Truly world-class dining. Worth every euro!", date: "1 month ago" },
      { user: "Sarah L.", rating: 5, text: "Best restaurant experience in Berlin. The 'Brutally Local' concept really shines through in every bite.", date: "3 weeks ago" },
    ],
  },
  2: {
    id: 2,
    name: "Berghain",
    type: "Club",
    cuisine: "Techno",
    location: "Berlin",
    neighborhood: "Friedrichshain",
    address: "Am Wriezener Bahnhof, 10243 Berlin",
    rating: 4.9,
    reviewCount: 2847,
    price: "€€",
    hours: "Fri-Mon: 23:00 - Late",
    phone: "+49 30 2936 0210",
    website: "https://berghain.berlin",
    description: "Berghain is one of the world's most famous techno clubs, housed in a former power plant. Known for its strict door policy, marathon weekend parties, and legendary sound system. The club has become a cultural institution, attracting techno enthusiasts from around the globe.",
    images: [
      "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
    ],
    features: ["Legendary", "24+ Hour Parties", "World-Class Sound", "Strict Door Policy"],
    reviews: [
      { user: "Max R.", rating: 5, text: "The ultimate techno experience. The sound system is mind-blowing and the atmosphere is unmatched anywhere in the world.", date: "1 week ago" },
      { user: "Lisa K.", rating: 5, text: "A rite of passage for any techno fan. The energy here is indescribable. Just be prepared to wait at the door.", date: "2 weeks ago" },
    ],
  },
  3: {
    id: 3,
    name: "Tantris",
    type: "Restaurant",
    cuisine: "Fine Dining",
    location: "Munich",
    neighborhood: "Schwabing",
    address: "Johann-Fichte-Straße 7, 80805 München",
    rating: 4.8,
    reviewCount: 521,
    price: "€€€€",
    hours: "Tue-Sat: 19:00 - 23:00",
    phone: "+49 89 361 9590",
    website: "https://tantris.de",
    description: "A two-Michelin-starred restaurant that has been a Munich institution since 1971. Chef Hans Haas creates innovative French cuisine with Mediterranean influences, served in a stunning 1970s-designed space. The restaurant is known for its exceptional service and extensive wine cellar.",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
    ],
    features: ["2 Michelin Stars", "Wine Cellar", "Private Dining", "Valet Parking"],
    reviews: [
      { user: "Michael B.", rating: 5, text: "Exceptional dining experience. The tasting menu was perfectly executed and the wine pairings were spot on.", date: "1 month ago" },
      { user: "Julia S.", rating: 5, text: "Worth the splurge! Every course was a masterpiece. The service was attentive without being intrusive.", date: "2 months ago" },
    ],
  },
  4: {
    id: 4,
    name: "Buck and Breck",
    type: "Bar",
    cuisine: "Speakeasy",
    location: "Berlin",
    neighborhood: "Mitte",
    address: "Brunnenstraße 177, 10119 Berlin",
    rating: 4.7,
    reviewCount: 189,
    price: "€€€",
    hours: "Tue-Sat: 20:00 - 02:00",
    phone: "+49 30 4373 3888",
    website: "https://buckandbreck.com",
    description: "A hidden speakeasy bar that's notoriously difficult to find - there's no sign, just a doorbell. Once inside, you'll discover one of Berlin's best cocktail bars, known for innovative drinks and an intimate atmosphere. The bar has been ranked among the world's best bars.",
    images: [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1551538827-9c0370b4eb6d?w=800&h=500&fit=crop",
    ],
    features: ["Hidden Entrance", "World-Class Cocktails", "Intimate Setting", "Reservations Recommended"],
    reviews: [
      { user: "David H.", rating: 5, text: "The best cocktails in Berlin. The bartenders are true artists. Finding the place is part of the adventure!", date: "3 weeks ago" },
      { user: "Emma W.", rating: 4, text: "Amazing drinks and atmosphere. A bit pricey but worth it for the experience.", date: "1 month ago" },
    ],
  },
  5: {
    id: 5,
    name: "Watergate",
    type: "Club",
    cuisine: "Electronic",
    location: "Berlin",
    neighborhood: "Kreuzberg",
    address: "Falckensteinstraße 49, 10997 Berlin",
    rating: 4.6,
    reviewCount: 1243,
    price: "€€",
    hours: "Thu-Sat: 23:00 - Late",
    phone: "+49 30 6128 0394",
    website: "https://water-gate.de",
    description: "A legendary techno club located right on the Spree River with stunning panoramic views. Watergate is known for its two floors - the Waterfloor for house music and the Floor for techno. The club features a terrace overlooking the river, making it a unique clubbing experience.",
    images: [
      "https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
    ],
    features: ["River Views", "Two Floors", "Terrace", "World-Class DJs"],
    reviews: [
      { user: "Tom M.", rating: 5, text: "Incredible views of the Spree and amazing sound system. One of my favorite clubs in Berlin!", date: "2 weeks ago" },
      { user: "Sophie L.", rating: 4, text: "Great venue with fantastic music. The terrace is perfect for taking a break from dancing.", date: "1 month ago" },
    ],
  },
  6: {
    id: 6,
    name: "Katz Orange",
    type: "Restaurant",
    cuisine: "Farm-to-Table",
    location: "Berlin",
    neighborhood: "Mitte",
    address: "Bergstraße 22, 10115 Berlin",
    rating: 4.5,
    reviewCount: 456,
    price: "€€€",
    hours: "Mon-Sat: 18:00 - 23:00",
    phone: "+49 30 983 208 430",
    website: "https://katzorange.com",
    description: "A sustainable restaurant set in a beautiful courtyard, focusing on organic, locally-sourced ingredients. The menu changes seasonally and features creative modern European cuisine. The restaurant has its own farm and works closely with local producers.",
    images: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
    ],
    features: ["Sustainable", "Organic", "Seasonal Menu", "Courtyard Dining"],
    reviews: [
      { user: "Maria G.", rating: 5, text: "Love their commitment to sustainability. The food is fresh and delicious, and the courtyard is beautiful in summer.", date: "2 weeks ago" },
      { user: "Peter F.", rating: 4, text: "Great concept and execution. The seasonal menu keeps things interesting.", date: "3 weeks ago" },
    ],
  },
};

const Venue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const venueId = Number(id);
  const venue = venueData[venueId] || {
    ...venueData[1],
    id: venueId,
    name: `Venue ${venueId}`,
    description: "A fantastic venue offering exceptional experiences. This location is known for its great atmosphere, quality service, and memorable nights out.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Breadcrumbs */}
        <div className="container mx-auto px-4">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Discover", href: "/discover" },
              { label: venue.name },
            ]}
          />
        </div>

        {/* Hero Images */}
        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
            <div className="md:col-span-2 rounded-2xl overflow-hidden">
              <img 
                src={venue.images[0]} 
                alt={venue.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop";
                }}
              />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4">
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={venue.images[1]} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop";
                  }}
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={venue.images[2]} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=500&fit=crop";
                  }}
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Scroll to review form or show review dialog
                      alert('Review form would appear here. In production, this would open a review submission form.');
                    }}
                  >
                    Write a Review
                  </Button>
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

                <Link to={`/plan?venue=${venue.id}`} className="w-full block">
                  <Button variant="neon" className="w-full" size="lg">
                    Reserve Now
                  </Button>
                </Link>

                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Save to favorites (would integrate with backend)
                      alert(`Saved ${venue.name} to your favorites!`);
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: venue.name,
                          text: `Check out ${venue.name} on Ausly!`,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    }}
                  >
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
