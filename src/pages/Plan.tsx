import { useState, useRef, useEffect, useCallback } from "react";
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
  DollarSign,
  Save,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useSaveItinerary } from "@/hooks/useItineraries";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CHAT_URL = `${SUPABASE_URL}/functions/v1/ai-planner`;

const vibes = [
  { id: "romantic", label: "Romantic", icon: Heart },
  { id: "chill", label: "Chill & Casual", icon: Wine },
  { id: "party", label: "Party Mode", icon: Music },
  { id: "foodie", label: "Foodie Adventure", icon: Utensils },
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
  onDelta,
  onDone,
  onError,
}: {
  prompt: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
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

const Plan = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [groupSize, setGroupSize] = useState("2");
  const [date, setDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryContent, setItineraryContent] = useState("");
  const [showItinerary, setShowItinerary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveItinerary = useSaveItinerary();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [itineraryContent]);

  const canGenerate = selectedCity && selectedVibe && selectedBudget && groupSize && date;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    setItineraryContent("");
    setShowItinerary(true);

    const prompt = `Create a detailed itinerary for a ${vibeMap[selectedVibe] || selectedVibe} in ${selectedCity} on ${date} for ${groupSize} ${Number(groupSize) === 1 ? "person" : "people"} with a ${budgetMap[selectedBudget] || selectedBudget} budget. Include specific times, venue names, estimated costs per person, and pro tips. Format with markdown.`;

    let content = "";
    try {
      await streamAI({
        prompt,
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
      const title = titleMatch ? titleMatch[1].slice(0, 80) : `${selectedVibe} night in ${selectedCity}`;
      await saveItinerary.mutateAsync({
        title,
        city: selectedCity,
        content: itineraryContent,
        stops: [],
      });
      toast({ title: "Itinerary saved! ✨", description: "View it in your profile." });
    } catch {
      toast({ title: "Error saving", description: "Please try again.", variant: "destructive" });
    }
  };

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
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 font-medium">
                      <Users className="w-4 h-4 text-primary" />
                      Group size
                    </label>
                    <Input type="number" min="1" max="20" value={groupSize} onChange={(e) => setGroupSize(e.target.value)} />
                  </div>
                </div>

                {/* Generate Button */}
                <Button variant="neon" size="xl" className="w-full" disabled={!canGenerate || isGenerating} onClick={handleGenerate}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Night Plan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
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
                      {isGenerating ? "Generating your itinerary..." : "Your personalized itinerary"}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold">
                    {vibeMap[selectedVibe]?.replace(/^\w/, c => c.toUpperCase()) || "Your Night"} in{" "}
                    <span className="gradient-text">{selectedCity}</span>
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    {date} • {groupSize} {Number(groupSize) === 1 ? "person" : "people"} • {selectedBudget} budget
                  </p>
                </div>

                {/* Streamed AI Content */}
                <div ref={scrollRef} className="prose prose-sm prose-invert max-w-none [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_li]:text-sm min-h-[200px]">
                  {itineraryContent ? (
                    <ReactMarkdown>{itineraryContent}</ReactMarkdown>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!isGenerating && itineraryContent && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border">
                    {user && (
                      <Button variant="neon" className="flex-1" onClick={handleSave} disabled={saveItinerary.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {saveItinerary.isPending ? "Saving..." : "Save Itinerary"}
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={() => { setShowItinerary(false); setItineraryContent(""); }}>
                      Generate New Plan
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
