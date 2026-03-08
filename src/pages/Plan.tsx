import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEOHead from "@/components/seo/SEOHead";
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
  DollarSign,
  Save,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSaveItinerary } from "@/hooks/useItineraries";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ChatActionButton from "@/components/chat/ChatActionButton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-planner`;

const ACTION_REGEX = /\{\{ACTION:([A-Z_]+):([^:]*):([^:]*):?([^}]*)\}\}/g;

const vibes = [
  { id: "romantic", label: "Romantic", icon: Heart, emoji: "💕" },
  { id: "chill", label: "Chill & Casual", icon: Wine, emoji: "🍷" },
  { id: "party", label: "Party Mode", icon: Music, emoji: "🎉" },
  { id: "foodie", label: "Foodie Adventure", icon: Utensils, emoji: "🍽️" },
];

const budgets = ["€", "€€", "€€€", "€€€€"];
const cities = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Düsseldorf"];

const budgetMap: Record<string, string> = {
  "€": "budget-friendly (under €30pp)",
  "€€": "moderate (€30-60pp)",
  "€€€": "upscale (€60-120pp)",
  "€€€€": "luxury (€120+pp)",
};

const vibeMap: Record<string, string> = {
  romantic: "romantic date night",
  chill: "chill and casual hangout",
  party: "party and nightlife",
  foodie: "foodie adventure with great restaurants",
};

async function streamAI({
  prompt,
  accessToken,
  onDelta,
  onDone,
  onError,
}: {
  prompt: string;
  accessToken: string | null;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Something went wrong. Please try again.");
    return;
  }
  if (!resp.body) { onError("No response stream"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* partial json */ }
    }
  }
  onDone();
}

/** Extract structured stops from AI markdown content */
function extractStops(content: string): Array<{ name: string; time: string; type: string; description: string; cost: string; venue_slug?: string }> {
  const stops: Array<{ name: string; time: string; type: string; description: string; cost: string; venue_slug?: string }> = [];
  
  // Match patterns like "**7:00 PM - Venue Name**" or "### 7:00 PM - Venue Name"
  const timeVenueRegex = /(?:\*\*|###?\s*)(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–—]\s*(.+?)(?:\*\*|$)/gmi;
  let match;
  const lines = content.split("\n");
  
  while ((match = timeVenueRegex.exec(content)) !== null) {
    const time = match[1].trim();
    const name = match[2].trim().replace(/\*+/g, "");
    
    // Find the line index and grab the next few lines for description
    const matchLineIdx = content.slice(0, match.index).split("\n").length - 1;
    const descLines: string[] = [];
    let cost = "";
    let venueSlug: string | undefined;
    
    for (let i = matchLineIdx + 1; i < Math.min(matchLineIdx + 6, lines.length); i++) {
      const l = lines[i]?.trim();
      if (!l || l.startsWith("**") || l.startsWith("###")) break;
      
      const costMatch = l.match(/[€$]\s*(\d+[\s-]*\d*)/);
      if (costMatch) cost = costMatch[0];
      
      const actionMatch = l.match(/\{\{ACTION:(?:VENUE|BOOK_VENUE):([^:}]+)/);
      if (actionMatch) venueSlug = actionMatch[1];
      
      if (!l.startsWith("{{")) {
        descLines.push(l.replace(/^\*/, "").replace(/\*$/, "").trim());
      }
    }
    
    stops.push({
      name,
      time,
      type: name.toLowerCase().includes("dinner") || name.toLowerCase().includes("restaurant") ? "dining" : 
            name.toLowerCase().includes("bar") || name.toLowerCase().includes("drink") ? "drinks" :
            name.toLowerCase().includes("club") || name.toLowerCase().includes("dance") ? "nightlife" : "activity",
      description: descLines.filter(d => d && !d.startsWith("{{")).join(" ").slice(0, 200),
      cost,
      venue_slug: venueSlug,
    });
  }
  
  return stops;
}

function renderContentWithActions(content: string) {
  const parts: Array<{ type: "text"; value: string } | { type: "action"; actionType: string; param1: string; param2: string; label: string }> = [];
  let lastIndex = 0;

  let match;
  const regex = new RegExp(ACTION_REGEX.source, "g");
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "action",
      actionType: match[1],
      param1: match[2],
      param2: match[3],
      label: match[4] || match[3] || "View",
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) =>
        part.type === "text" ? (
          <div key={i} className="prose prose-sm prose-invert max-w-none [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_li]:text-sm">
            <ReactMarkdown>{part.value}</ReactMarkdown>
          </div>
        ) : (
          <ChatActionButton
            key={i}
            type={part.actionType}
            param1={part.param1}
            param2={part.param2}
            label={part.label}
          />
        )
      )}
    </div>
  );
}

const Plan = () => {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [groupSize, setGroupSize] = useState("2");
  const [date, setDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryContent, setItineraryContent] = useState("");
  const [showItinerary, setShowItinerary] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveItinerary = useSaveItinerary();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [itineraryContent]);

  const totalSteps = 3;
  const progress = showItinerary ? 100 : (step / totalSteps) * 100;

  const canProceedStep1 = !!selectedCity;
  const canProceedStep2 = !!selectedVibe && !!selectedBudget;
  const canGenerate = canProceedStep1 && canProceedStep2 && !!groupSize && !!date;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    setItineraryContent("");
    setShowItinerary(true);
    setSavedId(null);

    const prompt = `Create a detailed itinerary for a ${vibeMap[selectedVibe] || selectedVibe} in ${selectedCity} on ${date} for ${groupSize} ${Number(groupSize) === 1 ? "person" : "people"} with a ${budgetMap[selectedBudget] || selectedBudget} budget. Include specific times, venue names from the database, estimated costs per person, pro tips, and transportation suggestions. Use the {{ACTION:VENUE:slug:Label}} and {{ACTION:BOOK_VENUE:slug:name:Label}} markers for each venue. Format with markdown.`;

    const { data: { session } } = await (await import("@/integrations/supabase/client")).supabase.auth.getSession();
    const accessToken = session?.access_token || null;

    let content = "";
    try {
      await streamAI({
        prompt,
        accessToken,
        onDelta: (chunk) => {
          content += chunk;
          setItineraryContent(content);
        },
        onDone: () => setIsGenerating(false),
        onError: (err) => {
          content += `\n\n⚠️ ${err}`;
          setItineraryContent(content);
          setIsGenerating(false);
        },
      });
    } catch {
      setItineraryContent(content + "\n\n⚠️ Connection error. Please try again.");
      setIsGenerating(false);
    }
  }, [canGenerate, isGenerating, selectedCity, selectedVibe, selectedBudget, groupSize, date]);

  const handleSave = async () => {
    if (!itineraryContent || !user) return;
    try {
      const titleMatch = itineraryContent.match(/^#\s*(.+)/m);
      const title = titleMatch ? titleMatch[1].slice(0, 80) : `${vibeMap[selectedVibe]?.replace(/^\w/, c => c.toUpperCase()) || "Night"} in ${selectedCity}`;
      const stops = extractStops(itineraryContent);
      const cleanContent = itineraryContent.replace(new RegExp(ACTION_REGEX.source, "g"), "");
      
      // Estimate total cost from stops
      let estimatedCost: number | undefined;
      const costMatches = itineraryContent.match(/€\s*(\d+)/g);
      if (costMatches) {
        estimatedCost = costMatches.reduce((sum, m) => sum + parseInt(m.replace(/[€\s]/g, "")), 0);
      }

      const saved = await saveItinerary.mutateAsync({
        title,
        city: selectedCity,
        content: cleanContent,
        stops,
        estimated_cost: estimatedCost,
      });
      setSavedId(saved.id);
      toast({ title: "Itinerary saved! ✨", description: "You can view it anytime from your profile." });
    } catch {
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setShowItinerary(false);
    setItineraryContent("");
    setStep(1);
    setSelectedCity("");
    setSelectedVibe("");
    setSelectedBudget("");
    setGroupSize("2");
    setDate("");
    setSavedId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-8">
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

          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className={step >= 1 || showItinerary ? "text-primary font-medium" : ""}>📍 City</span>
              <span className={step >= 2 || showItinerary ? "text-primary font-medium" : ""}>✨ Preferences</span>
              <span className={step >= 3 || showItinerary ? "text-primary font-medium" : ""}>📅 Details</span>
              <span className={showItinerary ? "text-primary font-medium" : ""}>🎉 Itinerary</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {!showItinerary ? (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-6 md:p-8 space-y-8">
                
                {/* Step 1: City */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-heading font-bold mb-1">Where are you heading?</h2>
                      <p className="text-sm text-muted-foreground">Pick a city to explore</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`p-5 rounded-xl border-2 transition-all duration-300 text-center ${
                            selectedCity === city
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <MapPin className={`w-5 h-5 mx-auto mb-2 ${selectedCity === city ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium">{city}</span>
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="neon"
                      size="lg"
                      className="w-full"
                      disabled={!canProceedStep1}
                      onClick={() => setStep(2)}
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Vibe & Budget */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-heading font-bold mb-1">What's the vibe?</h2>
                      <p className="text-sm text-muted-foreground">Tell us about your mood for {selectedCity}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {vibes.map((vibe) => (
                        <button
                          key={vibe.id}
                          onClick={() => setSelectedVibe(vibe.id)}
                          className={`p-5 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                            selectedVibe === vibe.id
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            selectedVibe === vibe.id ? "bg-primary/20" : "bg-muted"
                          }`}>
                            {vibe.emoji}
                          </div>
                          <span className="font-medium text-sm">{vibe.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 font-medium text-sm">
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

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button
                        variant="neon"
                        className="flex-1"
                        disabled={!canProceedStep2}
                        onClick={() => setStep(3)}
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Date & Group */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-heading font-bold mb-1">Final details</h2>
                      <p className="text-sm text-muted-foreground">When and with how many?</p>
                    </div>

                    {/* Summary chips */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary" className="gap-1.5">
                        <MapPin className="w-3 h-3" /> {selectedCity}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <Sparkles className="w-3 h-3" /> {vibes.find(v => v.id === selectedVibe)?.label}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <DollarSign className="w-3 h-3" /> {selectedBudget}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 font-medium text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          Date
                        </label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 font-medium text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          Group size
                        </label>
                        <Input type="number" min="1" max="20" value={groupSize} onChange={(e) => setGroupSize(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Back
                      </Button>
                      <Button variant="neon" size="lg" className="flex-1" disabled={!canGenerate || isGenerating} onClick={handleGenerate}>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Plan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* AI Generated Itinerary */
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="glass-card p-6 md:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isGenerating ? "Crafting your itinerary..." : "Your personalized itinerary"}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold">
                    {vibeMap[selectedVibe]?.replace(/^\w/, c => c.toUpperCase()) || "Your Night"} in{" "}
                    <span className="gradient-text">{selectedCity}</span>
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center mt-3">
                    <Badge variant="outline" className="gap-1.5">
                      <Calendar className="w-3 h-3" /> {date}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Users className="w-3 h-3" /> {groupSize} {Number(groupSize) === 1 ? "person" : "people"}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <DollarSign className="w-3 h-3" /> {selectedBudget} budget
                    </Badge>
                  </div>
                </div>

                {/* Streamed AI Content with action buttons */}
                <div ref={scrollRef} className="min-h-[200px]">
                  {itineraryContent ? (
                    renderContentWithActions(itineraryContent)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">AI is planning your perfect night...</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isGenerating && itineraryContent && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border">
                    {user && !savedId && (
                      <Button variant="neon" className="flex-1" onClick={handleSave} disabled={saveItinerary.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {saveItinerary.isPending ? "Saving..." : "Save Itinerary"}
                      </Button>
                    )}
                    {savedId && (
                      <Button variant="neon" className="flex-1" onClick={() => navigate(`/itinerary/${savedId}`)}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Saved Itinerary
                      </Button>
                    )}
                    {!user && (
                      <Button variant="neon" className="flex-1" onClick={() => navigate("/sign-in")}>
                        Sign in to save
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Plan
                    </Button>
                  </div>
                )}
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
