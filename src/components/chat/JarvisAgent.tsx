import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { X, Mic, MicOff, Send, Sparkles, MapPin, Heart, Calendar, ExternalLink, ChevronRight, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import hologramSrc from "@/assets/jarvis-hologram.png";

type Recommendation = {
  intent: string;
  city: string;
  hero: { kind: "venue" | "event"; slug: string; name: string; tagline: string; why: string; price?: string; category?: string; image?: string };
  alternatives: Array<{ kind: "venue" | "event"; slug: string; name: string; tagline: string; category?: string; image?: string }>;
};

type AgentState = "greeting" | "listening" | "thinking" | "speaking" | "results";

const SEEN_KEY = "ausly-jarvis-greeted";

const QUICK_PROMPTS = [
  "Romantic dinner tonight 💕",
  "Best techno party 🎧",
  "Cozy brunch spot ☕",
  "Something unique to try ✨",
];

function speak(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) { onEnd?.(); return; }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1.15; u.volume = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find(v => /female|samantha|victoria|karen|zira|google.*english/i.test(v.name)) || voices[0];
    if (female) u.voice = female;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
  } catch { onEnd?.(); }
}

export default function JarvisAgent() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<AgentState>("greeting");
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [agentMessage, setAgentMessage] = useState("");
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Auto-greet on first mobile visit
  useEffect(() => {
    if (!isMobile) return;
    const seen = sessionStorage.getItem(SEEN_KEY);
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SEEN_KEY, "1");
      const greeting = "Hi, I'm Ausly. Tell me what you're in the mood for tonight.";
      setAgentMessage(greeting);
      // Wait for voices to load
      setTimeout(() => speak(greeting), 400);
    }, 1500);
    return () => clearTimeout(t);
  }, [isMobile]);

  // Setup voice recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) {
        setListening(false);
        handleSubmit(final);
      }
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({ title: "Voice not supported", description: "Type your request below instead." });
      return;
    }
    try {
      window.speechSynthesis?.cancel();
      setTranscript("");
      setListening(true);
      setState("listening");
      recognitionRef.current.start();
    } catch { setListening(false); }
  }, [toast]);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;
    setInput("");
    setTranscript(text);
    setState("thinking");
    setAgentMessage("Scanning the city for you...");
    setRecommendation(null);

    try {
      const { data, error } = await supabase.functions.invoke("jarvis-agent", {
        body: { query: text, city: "Berlin" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const rec = data.recommendation as Recommendation;
      const spoken = data.spoken || "Here's what I found.";
      setAgentMessage(spoken);
      setRecommendation(rec);
      setState("speaking");
      speak(spoken, () => setState("results"));
      // Fallback in case speech doesn't fire
      setTimeout(() => setState("results"), 3000);
    } catch (e: any) {
      const msg = e?.message || "Connection issue. Try again.";
      setAgentMessage(msg);
      setState("greeting");
      toast({ title: "Hmm", description: msg, variant: "destructive" });
    }
  };

  const handleClose = () => {
    window.speechSynthesis?.cancel();
    stopListening();
    setOpen(false);
  };

  const handleReset = () => {
    setRecommendation(null);
    setTranscript("");
    setAgentMessage("What else are you in the mood for?");
    setState("greeting");
    speak("What else are you in the mood for?");
  };

  const goToDetail = (kind: "venue" | "event", slug: string) => {
    handleClose();
    navigate(kind === "venue" ? `/venue/${slug}` : `/event/${slug}`);
  };

  // Hide on desktop / admin / vendor
  if (!isMobile) return null;

  return (
    <>
      {/* Floating mini-orb to re-open */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setState("greeting"); setAgentMessage("Hey! What can I find for you?"); }}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full
            bg-gradient-to-br from-cyan-400/30 via-primary/40 to-fuchsia-500/30
            backdrop-blur-xl border border-cyan-300/40
            shadow-[0_0_30px_hsl(190_100%_60%/0.5),inset_0_0_20px_hsl(190_100%_70%/0.2)]
            flex items-center justify-center
            animate-pulse-slow hover:scale-110 transition-transform"
          aria-label="Open Ausly hologram"
        >
          <Sparkles className="w-6 h-6 text-cyan-100 drop-shadow-[0_0_8px_hsl(190_100%_70%)]" />
          <span className="absolute inset-0 rounded-full border border-cyan-300/30 animate-ping" />
        </button>
      )}

      {open && createPortal(<HologramOverlay
        state={state}
        agentMessage={agentMessage}
        transcript={transcript}
        input={input}
        setInput={setInput}
        listening={listening}
        startListening={startListening}
        stopListening={stopListening}
        onSubmit={handleSubmit}
        onClose={handleClose}
        recommendation={recommendation}
        onReset={handleReset}
        goToDetail={goToDetail}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />, document.body)}
    </>
  );
}

function HologramOverlay(props: any) {
  const { state, agentMessage, transcript, input, setInput, listening, startListening, stopListening, onSubmit, onClose, recommendation, onReset, goToDetail, toggleFavorite, isFavorite } = props;

  const showResults = state === "results" && recommendation;

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden flex flex-col">
      {/* Animated grid backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "linear-gradient(hsl(190 100% 50% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(190 100% 50% / 0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="absolute w-1 h-1 rounded-full bg-cyan-300/60 animate-float-particle"
            style={{
              left: `${(i * 47) % 100}%`,
              top: `${(i * 31) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-white/10">
        <X className="w-5 h-5" />
      </button>

      {/* Hologram face section */}
      <div className={`relative flex items-center justify-center transition-all duration-700 ${showResults ? "h-[28vh] pt-6" : "h-[55vh] pt-12"}`}>
        <HologramFace state={state} />
      </div>

      {/* Speech bubble / status */}
      <div className="relative px-6 text-center">
        {transcript && state !== "results" && (
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/60 mb-2">You said</p>
        )}
        {transcript && state !== "results" && (
          <p className="text-base text-white/90 italic mb-3 line-clamp-2">"{transcript}"</p>
        )}
        <div className="min-h-[3rem] flex items-center justify-center">
          {state === "thinking" ? (
            <div className="flex items-center gap-2 text-cyan-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm tracking-wide">{agentMessage}</span>
            </div>
          ) : (
            <p className={`text-base md:text-lg font-medium text-white leading-snug max-w-md ${state === "speaking" ? "animate-pulse-text" : ""}`}>
              {agentMessage}
            </p>
          )}
        </div>
      </div>

      {/* Bottom area */}
      <div className="relative flex-1 flex flex-col justify-end pb-6 px-4 mt-3 overflow-hidden">
        {showResults ? (
          <ResultsView rec={recommendation} goToDetail={goToDetail} toggleFavorite={toggleFavorite} isFavorite={isFavorite} onReset={onReset} />
        ) : (
          <InputArea
            input={input}
            setInput={setInput}
            listening={listening}
            startListening={startListening}
            stopListening={stopListening}
            onSubmit={onSubmit}
            disabled={state === "thinking"}
          />
        )}
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-30px) translateX(10px); opacity: 1; }
        }
        .animate-float-particle { animation: float-particle 5s ease-in-out infinite; }
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 30px hsl(190 100% 60% / 0.5), inset 0 0 20px hsl(190 100% 70% / 0.2); }
          50% { box-shadow: 0 0 50px hsl(190 100% 60% / 0.8), inset 0 0 30px hsl(190 100% 70% / 0.4); }
        }
        .animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite; }
        @keyframes pulse-text { 0%,100%{opacity:1} 50%{opacity:0.7} }
        .animate-pulse-text { animation: pulse-text 1.4s ease-in-out infinite; }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scan-line { animation: scan-line 3s linear infinite; }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        .ring-pulse { animation: ring-pulse 2s ease-in-out infinite; }
        @keyframes ring-pulse-fast {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .ring-pulse-fast { animation: ring-pulse-fast 0.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function HologramFace({ state }: { state: AgentState }) {
  const isActive = state === "listening" || state === "speaking";
  const isThinking = state === "thinking";
  return (
    <div className="relative w-[min(75vw,320px)] aspect-square">
      {/* Outer rings */}
      <div className={`absolute inset-0 rounded-full border border-cyan-400/30 ${isActive ? "ring-pulse-fast" : "ring-pulse"}`} />
      <div className={`absolute inset-4 rounded-full border border-cyan-300/20 ${isActive ? "ring-pulse-fast" : "ring-pulse"}`} style={{ animationDelay: "0.3s" }} />
      <div className={`absolute inset-8 rounded-full border border-fuchsia-400/20 ${isActive ? "ring-pulse-fast" : "ring-pulse"}`} style={{ animationDelay: "0.6s" }} />

      {/* Glow halo */}
      <div className="absolute inset-6 rounded-full bg-gradient-radial from-cyan-400/30 via-primary/10 to-transparent blur-2xl" />

      {/* Hologram image */}
      <div className="absolute inset-10 rounded-full overflow-hidden">
        <img
          src={hologramSrc}
          alt="Ausly AI"
          className={`w-full h-full object-cover mix-blend-screen ${isThinking ? "opacity-60" : "opacity-95"}`}
          style={{ filter: "hue-rotate(0deg) saturate(1.2) contrast(1.1) drop-shadow(0 0 20px hsl(190 100% 60%))" }}
        />
        {/* Scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 h-[3px] bg-gradient-to-b from-transparent via-cyan-300/80 to-transparent scan-line" />
        </div>
        {/* Color wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-fuchsia-500/10 mix-blend-overlay" />
      </div>

      {/* Bottom platform glow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-cyan-400/40 blur-2xl rounded-full" />

      {/* Status indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-300/30">
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-cyan-300 animate-pulse" : isThinking ? "bg-yellow-300 animate-pulse" : "bg-emerald-400"}`} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/90">
          {state === "listening" ? "Listening" : state === "thinking" ? "Processing" : state === "speaking" ? "Speaking" : "Online"}
        </span>
      </div>
    </div>
  );
}

function InputArea({ input, setInput, listening, startListening, stopListening, onSubmit, disabled }: any) {
  return (
    <div className="space-y-3">
      {/* Quick prompts */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin -mx-4 px-4">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onSubmit(p)}
            disabled={disabled}
            className="shrink-0 text-xs px-3 py-2 rounded-full bg-white/5 border border-cyan-300/20 text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-300/50 transition-all disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Mic + text input */}
      <div className="flex items-center gap-2">
        <button
          onClick={listening ? stopListening : startListening}
          disabled={disabled}
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all border ${
            listening
              ? "bg-fuchsia-500/30 border-fuchsia-300/60 shadow-[0_0_20px_hsl(320_100%_60%/0.6)]"
              : "bg-cyan-400/20 border-cyan-300/40 hover:bg-cyan-400/30"
          }`}
          aria-label={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? <MicOff className="w-5 h-5 text-fuchsia-100" /> : <Mic className="w-5 h-5 text-cyan-100" />}
        </button>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(input); }} className="flex-1 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or type your wish..."
            disabled={disabled}
            className="flex-1 h-12 px-4 rounded-full bg-white/5 border border-cyan-300/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-cyan-300/60 focus:bg-white/10 backdrop-blur-md"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center disabled:opacity-30 shadow-[0_0_20px_hsl(190_100%_60%/0.5)]"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>

      <p className="text-[10px] text-center text-white/40 uppercase tracking-[0.25em]">Tap mic to speak · Powered by Ausly AI</p>
    </div>
  );
}

function ResultsView({ rec, goToDetail, toggleFavorite, isFavorite, onReset }: any) {
  const hero = rec.hero;
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full pb-2">
      {/* Intent chip */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-300/30">
          ⭐ Top match · {rec.intent}
        </span>
        <button onClick={onReset} className="text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white">New search ↻</button>
      </div>

      {/* HERO CARD */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-300/30 bg-gradient-to-br from-cyan-950/60 via-black/80 to-fuchsia-950/40 backdrop-blur-xl shadow-[0_0_40px_hsl(190_100%_50%/0.3)]">
        {hero.image && (
          <div className="relative h-40 overflow-hidden">
            <img src={hero.image} alt={hero.name} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-cyan-300/40 text-[10px] text-cyan-100 uppercase tracking-wider">
              {hero.kind === "event" ? "Event" : hero.category || "Venue"}
            </div>
          </div>
        )}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{hero.name}</h3>
            <p className="text-sm text-cyan-200 mt-0.5">{hero.tagline}</p>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">{hero.why}</p>
          {hero.price && (
            <div className="text-[11px] text-white/60">💰 {hero.price}</div>
          )}

          {/* CTAs - the journey */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => goToDetail(hero.kind, hero.slug)}
              className="col-span-2 h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-[0_0_20px_hsl(190_100%_60%/0.5)] active:scale-95 transition-transform"
            >
              {hero.kind === "event" ? "Get tickets" : "View & book"} <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleFavorite?.({ entity_type: hero.kind, entity_id: hero.slug })}
              className="h-10 rounded-xl bg-white/5 border border-white/15 text-white text-xs flex items-center justify-center gap-1.5 hover:bg-white/10"
            >
              <Heart className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={() => { window.location.href = `https://maps.google.com/?q=${encodeURIComponent(hero.name + " " + rec.city)}`; }}
              className="h-10 rounded-xl bg-white/5 border border-white/15 text-white text-xs flex items-center justify-center gap-1.5 hover:bg-white/10"
            >
              <MapPin className="w-3.5 h-3.5" /> Directions
            </button>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 px-1">Or consider</p>
        <div className="grid grid-cols-2 gap-2">
          {rec.alternatives?.slice(0, 2).map((alt: any) => (
            <button
              key={alt.slug}
              onClick={() => goToDetail(alt.kind, alt.slug)}
              className="text-left rounded-xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md hover:border-cyan-300/40 transition-all active:scale-95"
            >
              {alt.image ? (
                <div className="h-20 bg-cover bg-center" style={{ backgroundImage: `url(${alt.image})` }} />
              ) : (
                <div className="h-20 bg-gradient-to-br from-cyan-900/40 to-fuchsia-900/40 flex items-center justify-center">
                  {alt.kind === "event" ? <Calendar className="w-6 h-6 text-cyan-300/60" /> : <Sparkles className="w-6 h-6 text-cyan-300/60" />}
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-semibold text-white line-clamp-1">{alt.name}</p>
                <p className="text-[10px] text-white/60 line-clamp-2 mt-0.5">{alt.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
