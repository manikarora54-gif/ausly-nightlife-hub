import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Users, 
  Utensils, 
  Music, 
  Wine,
  Heart,
  ArrowRight,
  Loader2,
  Calendar,
  DollarSign
} from "lucide-react";

const vibes = [
  { id: "romantic", label: "Romantic", icon: Heart },
  { id: "chill", label: "Chill & Casual", icon: Wine },
  { id: "party", label: "Party Mode", icon: Music },
  { id: "foodie", label: "Foodie Adventure", icon: Utensils },
];

const budgets = ["€", "€€", "€€€", "€€€€"];

const cities = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Düsseldorf"];

const mockItinerary = [
  {
    time: "19:00",
    name: "Nobelhart & Schmutzig",
    type: "Dinner",
    description: "Modern German cuisine with a focus on local ingredients",
    location: "Kreuzberg",
    duration: "2 hours",
    color: "primary",
  },
  {
    time: "21:30",
    name: "Buck and Breck",
    type: "Cocktails",
    description: "Hidden speakeasy with world-class mixology",
    location: "Mitte",
    duration: "1.5 hours",
    color: "secondary",
  },
  {
    time: "23:00",
    name: "Watergate",
    type: "Club",
    description: "Iconic club with panoramic views of the Spree",
    location: "Kreuzberg",
    duration: "Until late",
    color: "accent",
  },
];

const Plan = () => {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [groupSize, setGroupSize] = useState("2");
  const [date, setDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowItinerary(true);
    }, 2000);
  };

  const canGenerate = selectedCity && selectedVibe && selectedBudget && groupSize && date;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Planning</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">
              Plan Your Perfect{" "}
              <span className="gradient-text">Night Out</span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Tell us your preferences, and let AI craft your ideal evening itinerary
            </p>
          </div>

          {!showItinerary ? (
            /* Form */
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-6 md:p-8 space-y-8">
                {/* City Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-primary" />
                    Where are you heading?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {cities.map((city) => (
                      <Button
                        key={city}
                        variant={selectedCity === city ? "default" : "outline"}
                        onClick={() => setSelectedCity(city)}
                        className="justify-center"
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Vibe Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-primary" />
                    What's the vibe?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {vibes.map((vibe) => (
                      <button
                        key={vibe.id}
                        onClick={() => setSelectedVibe(vibe.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                          selectedVibe === vibe.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedVibe === vibe.id ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <vibe.icon className={`w-5 h-5 ${
                            selectedVibe === vibe.id ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <span className="font-medium">{vibe.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Selection */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-medium">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Budget per person
                  </label>
                  <div className="flex gap-2">
                    {budgets.map((budget) => (
                      <Button
                        key={budget}
                        variant={selectedBudget === budget ? "default" : "outline"}
                        onClick={() => setSelectedBudget(budget)}
                        className="flex-1"
                      >
                        {budget}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date & Group */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-primary" />
                      Date
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      Group size
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  variant="neon"
                  size="xl"
                  className="w-full"
                  disabled={!canGenerate || isGenerating}
                  onClick={handleGenerate}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating your perfect night...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Night Plan
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Itinerary Result */
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="glass-card p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Your personalized itinerary</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold">
                    {selectedVibe === "romantic" && "A Romantic Evening in "}
                    {selectedVibe === "chill" && "Chill Vibes in "}
                    {selectedVibe === "party" && "Party Night in "}
                    {selectedVibe === "foodie" && "Foodie Adventure in "}
                    <span className="gradient-text">{selectedCity}</span>
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {date} • {groupSize} {Number(groupSize) === 1 ? "person" : "people"} • {selectedBudget} budget
                  </p>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                  {mockItinerary.map((item, index) => (
                    <div key={index} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.color === "primary" ? "bg-primary/20 text-primary" :
                          item.color === "secondary" ? "bg-secondary/20 text-secondary" :
                          "bg-accent/20 text-accent"
                        }`}>
                          {item.time.split(":")[0]}
                        </div>
                        {index < mockItinerary.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 glass-card p-5 hover-glow ${
                        item.color === "primary" ? "border-primary/30" :
                        item.color === "secondary" ? "border-secondary/30" :
                        "border-accent/30"
                      }`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.color === "primary" ? "bg-primary/20 text-primary" :
                              item.color === "secondary" ? "bg-secondary/20 text-secondary" :
                              "bg-accent/20 text-accent"
                            }`}>
                              {item.type}
                            </span>
                            <h3 className="font-heading font-semibold text-lg mt-2">
                              {item.name}
                            </h3>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{item.time}</div>
                            <div>{item.duration}</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border">
                  <Button 
                    variant="neon" 
                    className="flex-1"
                    onClick={() => {
                      // Book all venues in itinerary
                      alert('Redirecting to booking page for all venues in your itinerary...');
                      // In real app, this would navigate to a booking page with all venues pre-selected
                    }}
                  >
                    Book All Venues
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowItinerary(false)}>
                    Generate New Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Plan;
